import { AddHelpTextContext } from '@commander-js/extra-typings'

import { Chain, isTronChain } from '@layerzerolabs/lz-definitions'
import { Deployable, OpsBundleConfig, OpsEnvironment, filterBundles, getLogger } from '@layerzerolabs/ops-core'

import { ARG_BUNDLES, OPTION_CHAINS, OPTION_ENV, OPTION_OVERWRITE, OPTION_STAGE, OPTION_TAGS } from '../options'
import { CommandExt } from '../utils'

import { getDeployOrder, isDeployable } from './utils'

const logger = getLogger()

function example(context: AddHelpTextContext): string {
    const cmd = context.command
    let cmdNames = cmd.name()
    for (let parentCmd = cmd.parent; parentCmd; parentCmd = parentCmd.parent) {
        cmdNames = parentCmd.name() + ' ' + cmdNames
    }

    return `
EXAMPLES:

  * Deploy bundles filtered with tags 'all-v1' to Ethereum and Aptos:

    ${cmdNames} -e local -s sandbox --filter all-v1 -c ethereum,aptos

  * Deploy bundles with names 'oracle' or 'relayer' and tags 'all-v1' to Ethereum and Aptos:

    ${cmdNames} oracle,relayer -e local -s sandbox --filter all-v1 -c ethereum,aptos

  * Deploy bundles specific to ZkSync with 'all-v1' to the ZkSync chain, in case of bundles with the same name, choose the ones associated with ZkSync:

    ${cmdNames} -e local -s sandbox --filter all-v1 -c zksync
`
}

const command = new CommandExt()
    .name('deploy')
    .description('Deploy contracts')
    .usage(`[bundles] [options]`)
    .addOption(OPTION_TAGS)
    .addOption(OPTION_STAGE)
    .addOption(OPTION_ENV)
    .addOption(OPTION_CHAINS)
    .addOption(OPTION_OVERWRITE)
    .allowUnknownOption(false)
    .addArgument(ARG_BUNDLES)
    .allowExcessArguments(false)
    .action(commandAction)

command.addHelpText('after', example)

async function commandAction(bundleNames: string[] | undefined): Promise<void> {
    // @ts-expect-error TS2339 We sure we have __CONTEXT__ in command options
    const context = command.opts().__CONTEXT__ as OpsEnvironment

    const {
        tags: opt_tags,
        env: opt_env,
        stage: opt_stage,
        chains: opt_chains,
        overwrite: opt_overwrite,
    } = command.opts()

    console.log(command.opts())
    if (opt_chains === undefined || opt_chains.length === 0) {
        console.log('at least specify one chain.')
        process.exit(1)
    }
    const deployers: { [key in Chain]?: Deployable[] } = {}
    opt_chains.map((chain: Chain) => {
        // bundles meet filter criteria
        let bundles = findBundles(context.config.bundles, bundleNames ?? [], opt_tags, [chain])
        // logger.debug({ message: bundles, format: ``})

        // filter out bundles that disregard the deployment process
        bundles = bundles.filter((x) => x.deploy !== undefined && !x.deploy.skip)

        // sort bundles
        bundles = bundles.sort((a, b) => getDeployOrder(a) - getDeployOrder(b))

        logger.debug({ message: bundles, format: `bundles for ${chain}: %s`, pretty: true })

        for (const bundle of bundles) {
            const deployer = bundle.deploy?.deployer
            if (deployer === undefined) {
                continue
            }

            if (!isDeployable(deployer)) {
                throw new Error(`the deploy of ${bundle.name} is not a deployable`)
            }
            deployers[chain] = deployers[chain] ? deployers[chain]?.concat(deployer) : [deployer]
        }
    })

    await Promise.all(
        opt_chains.map(async (chain: Chain) => {
            for (const deployer of deployers[chain] ?? []) {
                if (deployer.preDeploy !== undefined) {
                    await deployer.preDeploy({
                        overwrite: opt_overwrite,
                        stage: opt_stage,
                        env: opt_env,
                        chains: [chain],
                        options: [],
                    })
                }
            }
        })
    )

    for (const chain in deployers) {
        for (const deployer of deployers[chain as Chain] ?? []) {
            await deployer.compile({
                stage: opt_stage,
                env: opt_env,
                chains: [chain as Chain],
                options: isTronChain(chain as Chain) ? ['--no-copy-artifacts', '--no-copy-deployments'] : [],
            })
        }
    }

    await Promise.all(
        opt_chains.map(async (chain: Chain) => {
            for (const deployer of deployers[chain] ?? []) {
                await deployer.deploy({
                    overwrite: opt_overwrite,
                    stage: opt_stage,
                    env: opt_env,
                    chains: [chain],
                    options: [],
                })
            }
        })
    )

    await Promise.all(
        opt_chains.map(async (chain: Chain) => {
            for (const deployer of deployers[chain] ?? []) {
                if (deployer.postDeploy !== undefined) {
                    await deployer.postDeploy({
                        overwrite: opt_overwrite,
                        stage: opt_stage,
                        env: opt_env,
                        chains: [chain],
                        options: [],
                    })
                }
            }
        })
    )
}

function findBundles(
    bundles: OpsBundleConfig[],
    bundleNames: string[],
    tagsGroups: string[][],
    chains: Chain[]
): OpsBundleConfig[] {
    const foundBundles = filterBundles(bundles, bundleNames, tagsGroups, chains)
    const dependBundles = foundBundles.flatMap((bundle) => {
        const dependencies = bundle.deploy?.dependencies ?? []
        const tags = OPTION_TAGS.parseArg!(dependencies.join(','), [[]]) as string[][]
        if (dependencies.length === 0) {
            return []
        }
        return [...findBundles(bundles, dependencies, [], chains), ...findBundles(bundles, [], tags, chains)]
    })
    const result = [...dependBundles, ...foundBundles]
    // unique dependBundles but keep the order
    return result.filter((bundle, index) => result.indexOf(bundle) === index)
}

export default command
