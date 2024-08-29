import { AddHelpTextContext, Option, createOption } from '@commander-js/extra-typings'
import prompt from '@inquirer/confirm'
import _ from 'lodash'

import {
    Chain,
    ChainType,
    EndpointVersion,
    Network,
    Stage,
    chainAndStageToEndpointId,
    chainAndStageToNetwork,
    getChainType,
} from '@layerzerolabs/lz-definitions'
import {
    BlacklistConnectionConfig,
    Configurable,
    Deployment,
    OpsBundleConfig,
    OpsEnvironment,
    Transaction,
    TransactionGroup,
    filterBundles,
    getLogger,
} from '@layerzerolabs/ops-core'

import {
    ARG_BUNDLES,
    OPTION_CONFIRMS,
    OPTION_DRYRUN,
    OPTION_ENV,
    OPTION_NO_PROMPT,
    OPTION_SKIP_FUNCTIONS,
    OPTION_STAGE,
    OPTION_TAGS,
} from '../options'
import { CommandExt } from '../utils'

import { isSupportChainAndStageAndVersion, toDisplay, verifyBlackConnectionSymmetrical, writeToCsv } from './kits'
import './type-extensions'
import {
    groupTransactionsBySignerAndIsolate,
    isConfigurable,
    isDifferableTransaction,
    isTransaction,
    isTransactionGroup,
    isTransactionOrTransactionGroupNeedChange,
    printSendProgress,
    removeTransactionGroupNoNeedChangeTxns,
} from './utils'

const logger = getLogger()

interface FilterExGroup {
    chain?: Chain
    chainType?: ChainType
    endpointVersion: EndpointVersion
    tags: string[]
}

interface EndpointCriteria {
    chain: Chain
    chainType: ChainType
    endpointVersion: EndpointVersion
}

interface FilterRule {
    endpointGroups: EndpointCriteria[]
    tagsGroups: string[][]
}

interface WireTransaction {
    network: Network
    configurator: Configurable
    txns: (Transaction | TransactionGroup)[]
}

export function generateCombinations(arr: unknown[][]): unknown[][] {
    if (arr.length === 0) {
        return [[]]
    }

    const [first, ...rest] = arr
    const restCombs = generateCombinations(rest)
    const combs: unknown[][] = []

    for (const val of first) {
        for (const restComb of restCombs) {
            combs.push([val, ...restComb])
        }
    }

    return combs
}

export function processEndpointCriteria(x: string): EndpointCriteria | EndpointCriteria[] {
    if (!x.includes(':')) {
        // version,... pattern
        const endpointVersion = Object.values(EndpointVersion).includes(x as EndpointVersion)
            ? (x as EndpointVersion)
            : undefined
        if (endpointVersion === undefined) {
            throw new Error(`invalid endpoint version ${x}`)
        }
        return Object.values(Chain).map((chain) => {
            const chainType = getChainType(chain)
            return {
                chain: chain,
                chainType: chainType,
                endpointVersion: endpointVersion,
            }
        })
    }

    // chain:version,... pattern
    const [chainOrChainType, endpointVersionStr] = x.split(':').map((s) => s.trim())

    const chain = Object.values(Chain).includes(chainOrChainType as Chain) ? (chainOrChainType as Chain) : undefined

    const endpointVersion = Object.values(EndpointVersion).includes(endpointVersionStr as EndpointVersion)
        ? (endpointVersionStr as EndpointVersion)
        : undefined

    if (endpointVersion === undefined) {
        throw new Error(`invalid endpoint version ${x}`)
    }

    if (chain !== undefined) {
        const chainType = getChainType(chain)
        return {
            chain: chain,
            chainType: chainType,
            endpointVersion: endpointVersion,
        }
    }
    // chainType:version,... pattern
    const chainType = Object.values(ChainType).includes(chainOrChainType as ChainType)
        ? (chainOrChainType as ChainType)
        : undefined
    if (chainType === undefined) {
        throw new Error(`invalid chainOrChainType ${chainOrChainType}`)
    }
    if (chainType === ChainType.UNKNOWN) {
        throw new Error(`invalid chainType ${chainType}`)
    }
    return Object.values(Chain)
        .filter((chain) => {
            return getChainType(chain) === chainType
        })
        .map((chain) => {
            const chainType = getChainType(chain)
            return {
                chain: chain,
                chainType: chainType,
                endpointVersion: endpointVersion,
            }
        })
}

/**
 * define the option and implement parser for local and remote option
 * e.g., --from "[ethereum:v2, bsc:v2]:[counter:v1, counter:v2]"
 * the option value contains two arrays: "[]:[]", the first one is [Chain:EndpointVersion, ...], the second one is [Tag:Tag..., ...]
 * @param long option name
 * @param short
 * @param description option description
 * @returns
 */
export function filterExOptionBuilder(long: string, short: string, description: string): Option {
    const parseFilter = (filterOpt: string): FilterRule => {
        if (filterOpt === '') {
            return {
                endpointGroups: [],
                tagsGroups: [],
            }
        }

        // use regular expression to match the option value
        const PATTERN = /\[([^\]]*?)](?::\[([^\]]*?)])?/
        let matches = filterOpt.match(PATTERN)
        if (!matches) {
            // try chain:version,... pattern
            const PATTERN2 = /(^\w+:\w+(?:,\w+:\w+)*?$)/
            matches = filterOpt.match(PATTERN2)
        }
        if (!matches) {
            // try version,... pattern
            const PATTERN3 = /(^\w+(?:,\w+)*?$)/
            matches = filterOpt.match(PATTERN3)
        }
        if (!matches) {
            throw new Error(
                `${long} option must satisfy pattern [Chain:EndpointVersion, ...]:[Tag:Tag..., ...] or Chain:EndpointVersion,...`
            )
        }

        // handle networks, Chain:EndpointVersion, ...
        const endpointGroups = matches[1]
            .split(',')
            .map((x) => {
                return processEndpointCriteria(x)
            })
            .flat()

        // Tag:Tag:..., ...
        const tagsGroups =
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            matches[2] === '' || matches[2] === undefined
                ? [] // if no tags, then return empty array
                : matches[2].split(',').map((x) => {
                      return x.split(':')
                  })
        return {
            endpointGroups,
            tagsGroups: tagsGroups,
        }
    }
    return createOption(`-${short}, --${long} <string>`, description).default([]).argParser(parseFilter)
}

interface FilteredBundles {
    filter: FilterExGroup
    bundles: OpsBundleConfig[]
}

/**
 * filter the bundles for each filterGroup
 * @param bundles
 * @param filterGroups
 * @param bundleNames
 * @returns
 */
function filterBundlesEx(
    bundles: OpsBundleConfig[],
    bundleNames: string[] | undefined,
    filterGroups: FilterExGroup[]
): FilteredBundles[] {
    return filterGroups.map((filterGroup) => {
        const candidates = findBundles(
            bundles,
            bundleNames ?? [],
            [filterGroup.tags],
            filterGroup.chain != null ? [filterGroup.chain] : []
        )

        return {
            filter: filterGroup,
            bundles: candidates,
        }
    })
}

function findBundles(
    bundles: OpsBundleConfig[],
    bundleNames: string[],
    tagsGroups: string[][],
    chains: Chain[]
): OpsBundleConfig[] {
    const foundBundles = filterBundles(bundles, bundleNames, tagsGroups, chains)
    const dependBundles = foundBundles.flatMap((bundle) => {
        const dependencies = bundle.config?.dependencies ?? []
        if (dependencies.length === 0) {
            return []
        }
        const tags = OPTION_TAGS.parseArg!(dependencies.join(','), [[]]) as string[][]
        return [...findBundles(bundles, dependencies, [], chains), ...findBundles(bundles, [], tags, chains)]
    })
    const result = [...dependBundles, ...foundBundles]
    // unique dependBundles but keep the order
    return result.filter((bundle, index) => result.indexOf(bundle) === index)
}

async function getDeployments(bundleConfig: OpsBundleConfig, networks: Network[]): Promise<Deployment[]> {
    const deployer = bundleConfig.deploy?.deployer
    if (deployer === undefined) {
        return []
    }
    return deployer.getDeployments(networks)
}

async function wireAll(
    wireTransactions: WireTransaction[],
    noPrompt = false,
    confirms = 0,
    dryrun = false,
    skipFunctions: string[]
): Promise<void> {
    const transactions = wireTransactions
        .map((x) => x.txns)
        .flat()
        .map((x) => {
            if (isTransaction(x)) {
                return [x]
            } else if (isTransactionGroup(x)) {
                return x.txns
            } else {
                return []
            }
        })
        .flat()

    // match the transaction needs to be skipped
    transactions.map((x) => {
        if ('method' in x) {
            const { method } = x
            if (skipFunctions.includes(method as string)) {
                x.skipped = true
            }
        }
    })

    const needChanges = transactions.reduce((acc, txn) => {
        return acc + (isDifferableTransaction(txn) && txn.needChange ? 1 : 0)
    }, 0)

    logger.info(`collected transactions: ${transactions.length}, needChange transactions: ${needChanges}`)

    writeToCsv('./transactions.csv', transactions)

    if (needChanges == 0) {
        console.log('No changes needed')
        return
    }

    Object.entries(_.groupBy(transactions, 'network')).forEach(([network, txns]) => {
        console.log(`************************************************`)
        console.log(`Transaction for ${network}`)
        console.log(`************************************************`)
        const transactionNeedingChange = txns
            .filter((transaction) => isDifferableTransaction(transaction) && transaction.needChange)
            .map((x) => _.omit(toDisplay(x), ['raw']))
        if (!transactionNeedingChange.length) {
            console.log('No change needed')
        } else {
            console.table(transactionNeedingChange)
        }
    })

    if (!noPrompt && !dryrun) {
        try {
            const answer = await prompt({ message: 'Would you like to proceed with above instruction?' })
            if (!answer) {
                return
            }
        } catch (e) {
            return
        }
    }

    const needChangeTransactions = transactions.filter(
        (transaction) => isDifferableTransaction(transaction) && transaction.needChange && transaction.skipped !== true
    )
    const totalByNetwork: { [p: string]: number } = Object.fromEntries(
        Object.entries(_.groupBy(needChangeTransactions, 'network')).map(([network, value]) => [network, value.length])
    )

    const startIndexes: { [network: string]: number } = {}
    const printResult: { [network: string]: { request: string; current: string } } = {}
    await Promise.all(
        Object.entries(_.groupBy(wireTransactions, 'network')).map(async ([_network, wireTxns]) => {
            for (const wireTransaction of wireTxns) {
                const { configurator } = wireTransaction
                const groupedTxns = groupTransactionsBySignerAndIsolate(wireTransaction.txns)
                for (const req of groupedTxns) {
                    if (!isTransactionOrTransactionGroupNeedChange(req)) {
                        continue
                    }
                    const filteredReq = removeTransactionGroupNoNeedChangeTxns(req)

                    if (dryrun) {
                        logger.debug({ message: filteredReq, format: 'deployments: %s', pretty: true })
                        continue
                    }

                    const txns = await configurator.signTransactions([filteredReq]) // gnosis will return 1, others return more transactions
                    for (const signedTxn of txns) {
                        await configurator.sendTransactions([signedTxn], confirms)
                        // for print progress
                        printSendProgress(signedTxn, startIndexes, totalByNetwork, printResult)
                    }
                }
            }
        })
    )
}

const OPTION_FROM = filterExOptionBuilder('from', 'f', 'filter from bundles') as Option<
    '-f, --from <string>',
    undefined,
    FilterRule,
    FilterRule
>
const OPTION_TO = filterExOptionBuilder('to', 't', 'filter to bundles') as Option<
    '-t, --to <string>',
    undefined,
    FilterRule,
    FilterRule
>

function example(context: AddHelpTextContext): string {
    const cmd = context.command
    let cmdNames = cmd.name()
    for (let parentCmd = cmd.parent; parentCmd; parentCmd = parentCmd.parent) {
        cmdNames = parentCmd.name() + ' ' + cmdNames
    }

    return `
EXAMPLES:

  * Config bundles filtered with tags 'all-v1', from and to specify the endpoint versions:

    ${cmdNames} -e local -s sandbox --filter all-v1 --from '[ethereum:v1,aptos:v1] --to '[ethereum:v1,aptos:v1]'

  * Config bundles with names 'oracle' or 'relayer' and tags 'all-v1', from and to specify the endpoint versions:

    ${cmdNames} oracle,relayer -e local -s sandbox --filter all-v1 --from '[ethereum:v1,aptos:v1] --to '[ethereum:v1,aptos:v1]'

  * Config bundles specific to ZkSync with 'all-v1' to the ZkSync chain, in case of bundles with the same name, choose the ones associated with ZkSync:

    ${cmdNames} counter -e local -s sandbox --from '[ethereum:v2,solana:v2]:[all-v2] --to '[aptos:v1]:[all-v1]'
`
}

const command = new CommandExt()
    .name('config')
    .description('Config contracts')
    .usage(`[bundles] [options]`)
    .addOption(OPTION_TAGS)
    .addOption(OPTION_FROM)
    .addOption(OPTION_TO)
    .addOption(OPTION_STAGE)
    .addOption(OPTION_ENV)
    .addOption(OPTION_NO_PROMPT)
    .addOption(OPTION_CONFIRMS)
    .addOption(OPTION_DRYRUN)
    .addOption(OPTION_SKIP_FUNCTIONS)
    .allowUnknownOption(false)
    .addArgument(ARG_BUNDLES)
    .allowExcessArguments(false)
    .action(commandAction)

command.addHelpText('after', example)

function genEndpointTagCombinations(endpointGroups: EndpointCriteria[], tagsGroups: string[][]): FilterExGroup[] {
    return generateCombinations([endpointGroups, tagsGroups]).map((x) => {
        const endpoint = x[0] as EndpointCriteria
        const tags = x[1] as string[]
        return {
            chain: endpoint.chain,
            chainType: endpoint.chainType,
            endpointVersion: endpoint.endpointVersion,
            tags,
        }
    })
}

function genBundleParis(
    bundles: OpsBundleConfig[],
    bundleNames: string[] | undefined,
    fromEndpointGroups: EndpointCriteria[],
    fromTagsGroups: string[][],
    toEndpointGroups: EndpointCriteria[],
    toTagsGroups: string[][]
): [FilteredBundles, FilteredBundles[]][] {
    const fromFilters: FilterExGroup[] = genEndpointTagCombinations(fromEndpointGroups, fromTagsGroups)
    const toFilters: FilterExGroup[] = genEndpointTagCombinations(toEndpointGroups, toTagsGroups)
    return generateCombinations([
        filterBundlesEx(bundles, bundleNames, fromFilters),
        [filterBundlesEx(bundles, bundleNames, toFilters)],
    ]) as [FilteredBundles, FilteredBundles[]][]
}

function genBundleParisWithBlacklistConnection(
    blackListConnectionConfig: BlacklistConnectionConfig,
    stage: Stage,
    bundles: OpsBundleConfig[],
    bundleNames: string[] | undefined,
    fromEndpointGroups: EndpointCriteria[],
    fromTagsGroups: string[][],
    toEndpointGroups: EndpointCriteria[],
    toTagsGroups: string[][]
): [FilteredBundles, FilteredBundles[]][] {
    const blacklistConnectionsByStage = blackListConnectionConfig[stage]
    if (!blacklistConnectionsByStage) {
        throw new Error(`blacklistConnections not found for stage ${stage}`)
    }
    // verify blacklistConnections
    verifyBlackConnectionSymmetrical(blacklistConnectionsByStage)

    const pairs: [FilteredBundles, FilteredBundles[]][] = []

    for (const fromEndpointGroup of fromEndpointGroups) {
        // filter to endpointGroup from blacklistConnections
        const fromKey = `${fromEndpointGroup.chain}-${fromEndpointGroup.endpointVersion}`
        const blacklistRemotes = blacklistConnectionsByStage[fromKey]

        const filteredToEndpointGroups: EndpointCriteria[] =
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            blacklistRemotes !== undefined
                ? toEndpointGroups.filter((toEndpointGroup) => {
                      const toKey = `${toEndpointGroup.chain}-${toEndpointGroup.endpointVersion}`
                      return !blacklistRemotes.includes(toKey)
                  })
                : toEndpointGroups

        pairs.push(
            ...genBundleParis(
                bundles,
                bundleNames,
                [fromEndpointGroup],
                fromTagsGroups,
                filteredToEndpointGroups,
                toTagsGroups
            )
        )
    }
    return pairs
}

async function commandAction(bundleNames: string[] | undefined): Promise<void> {
    // @ts-expect-error TS2339 We sure we have __CONTEXT__ in command options
    const context = command.opts().__CONTEXT__ as OpsEnvironment
    const {
        tags: opt_tags,
        from: opt_tags_from,
        to: opt_tags_to,
        env: opt_env,
        stage: opt_stage,
        noPrompt: opt_noPrompt,
        confirms: opt_confirms,
        dryRun: opt_dryrun,
        skipFunctions: opt_skip_functions,
    } = command.opts()

    // filter not support endpointGroup
    opt_tags_from.endpointGroups = opt_tags_from.endpointGroups.filter((x) => {
        return isSupportChainAndStageAndVersion(x.chain, opt_stage, x.endpointVersion)
    })
    opt_tags_to.endpointGroups = opt_tags_to.endpointGroups.filter((x) => {
        return isSupportChainAndStageAndVersion(x.chain, opt_stage, x.endpointVersion)
    })

    let fromTagsGroups: string[][]
    let toTagsGroups: string[][]
    if (opt_tags.length > 0) {
        if (opt_tags_from.tagsGroups.length !== 0) {
            throw new Error(`should not specify tags in --from when --filter are used.`)
        }

        if (opt_tags_to.tagsGroups.length !== 0) {
            throw new Error(`should not specify tags in --to when --filter are used.`)
        }
        fromTagsGroups = opt_tags
        toTagsGroups = opt_tags
    } else {
        fromTagsGroups = opt_tags_from.tagsGroups
        toTagsGroups = opt_tags_to.tagsGroups
    }

    const pairs: [FilteredBundles, FilteredBundles[]][] = []
    const blacklistConnectionConfig = context.config.blacklistConnections

    if (blacklistConnectionConfig) {
        pairs.push(
            ...genBundleParisWithBlacklistConnection(
                blacklistConnectionConfig,
                opt_stage,
                context.config.bundles,
                bundleNames,
                opt_tags_from.endpointGroups,
                fromTagsGroups,
                opt_tags_to.endpointGroups,
                toTagsGroups
            )
        )
    } else {
        pairs.push(
            ...genBundleParis(
                context.config.bundles,
                bundleNames,
                opt_tags_from.endpointGroups,
                fromTagsGroups,
                opt_tags_to.endpointGroups,
                toTagsGroups
            )
        )
    }
    if (pairs.length === 0) {
        console.log(`pairs is empty, please specify --from`)
        process.exit(1)
    }

    const wireTransactions: WireTransaction[] = []
    const postConfigFunctions: (() => Promise<void>)[] = []
    await Promise.all(
        pairs.map(async ([from, to]) => {
            for (const left of from.bundles) {
                const configurator = left.config?.configurator
                if (configurator === undefined) {
                    continue
                }
                if (left.config?.skip === true) {
                    continue
                }

                if (!isConfigurable(configurator)) {
                    throw new Error(`the configurator of ${left.ident} is not a Configurable`)
                }

                if (from.filter.chain === undefined) {
                    throw new Error(`from.filter.chain is undefined`)
                }
                const fromNetwork = chainAndStageToNetwork(from.filter.chain, opt_stage, opt_env)
                const toNetworks = _.uniq(to.map((x) => chainAndStageToNetwork(x.filter.chain!, opt_stage, opt_env)))

                const requirements = (left.config?.requirements ?? []).map((x: string) => {
                    const requiredBundle = context.config.bundles.find((p) => p.alias === x)
                    if (!requiredBundle) {
                        throw new Error(`No project with alias ${x}`)
                    }
                    return requiredBundle
                })

                const deployments: Deployment[] = (
                    await Promise.all(
                        _.uniqBy(
                            [...from.bundles, ...requirements, ...to.flatMap((x) => x.bundles)],
                            (x) => x.ident
                        ).map(async (x) => getDeployments(x, [fromNetwork, ...toNetworks]))
                    )
                ).flat()

                const fromEndpointId = chainAndStageToEndpointId(
                    from.filter.chain,
                    opt_stage,
                    from.filter.endpointVersion
                )

                const toEndpointIds = _.uniq(
                    to.map((x) => chainAndStageToEndpointId(x.filter.chain!, opt_stage, x.filter.endpointVersion))
                )

                console.log(`\n************************************************`)
                console.log(
                    `Computing diff bundle ${left.name}${
                        left.alias != undefined ? '(' + left.alias + ')' : ''
                    } ${fromNetwork}(${fromEndpointId}) -> [${toNetworks.join(',')}]([${toEndpointIds.join(',')}])`
                )
                console.log(`************************************************`)
                if (configurator.preConfig !== undefined) {
                    await configurator.preConfig(fromEndpointId, toEndpointIds, deployments, {
                        stage: opt_stage,
                        env: opt_env,
                        ...left.config?.options,
                    })
                }
                if (configurator.postConfig !== undefined) {
                    const postConfigFunc = configurator.postConfig.bind(
                        configurator,
                        fromEndpointId,
                        toEndpointIds,
                        deployments,
                        {
                            stage: opt_stage,
                            env: opt_env,
                            ...left.config?.options,
                        }
                    )
                    postConfigFunctions.push(postConfigFunc)
                }
                const transactions = await configurator.collectTransactions(
                    fromEndpointId,
                    toEndpointIds,
                    deployments,
                    {
                        stage: opt_stage,
                        env: opt_env,
                        ...left.config?.options,
                    }
                )

                // ensure the network property is consistent
                for (const transaction of transactions) {
                    if (transaction.type === 'TransactionGroup') {
                        const match = transaction.txns.every((x) => x.network === transaction.network)
                        if (!match) {
                            throw new Error(
                                `network property of txns doesn't match the network property of TransactionGroup`
                            )
                        }
                    }
                }

                const objects = Object.entries(_.groupBy(transactions, 'network'))
                    .map(([network, txns]) => {
                        return { network: network as Network, configurator, txns } satisfies WireTransaction
                    })
                    .flat()
                wireTransactions.push(...objects)
            }
        })
    )

    await wireAll(wireTransactions, opt_noPrompt, parseInt(opt_confirms.toString()), opt_dryrun, opt_skip_functions)
    await Promise.all(postConfigFunctions.map(async (func) => func()))
}

export default command
