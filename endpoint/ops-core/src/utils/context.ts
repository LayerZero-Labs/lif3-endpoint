import path from 'path'

import _ from 'lodash'

import { Chain, getChainType } from '@layerzerolabs/lz-definitions'

import { OpsBundleConfig, OpsConfig, OpsUserConfig, OpsUserConfigProcessor } from '../types/config'
import { OpsContext } from '../types/context'
import { OpsEnvironment } from '../types/runtime'

import { MatcherOptions, findUpSync } from './findup'
import { getBundleIdent } from './ident'

export const TS_CONFIG_FILE_NAME = 'belowzero.config.ts'
export const JS_CONFIG_FILE_NAME = 'belowzero.config.js'
export const CJS_CONFIG_FILE_NAME = 'belowzero.config.cjs'

export const CONFIG_FILE_NAMES = [TS_CONFIG_FILE_NAME, JS_CONFIG_FILE_NAME, CJS_CONFIG_FILE_NAME]

export function findConfigPath(options?: MatcherOptions): string {
    if (options?.cwd === undefined) {
        throw new Error('options.cwd is required')
    }

    const candidates = [TS_CONFIG_FILE_NAME, JS_CONFIG_FILE_NAME, CJS_CONFIG_FILE_NAME]
    const foundPath = findUpSync(candidates, options)
    if (foundPath === undefined) {
        throw new Error(`Cannot find config file in ${options.cwd} or its parent directories`)
    }

    return foundPath
}

export function loadConfig(configPath: string): OpsUserConfig {
    // WARNING: require('ts-node') will cause '[ERROR] Unterminated template (867:31) [plugin commonjs]' in some cases
    //   this error can be eliminated by assigning the name to a variable and require that variable
    const moduleName = 'ts-node'
    const tsnode = require(moduleName)
    tsnode.register({
        transpileOnly: true,
        typeCheck: false,
    })

    try {
        const imported = require(configPath)
        return imported.default !== undefined ? imported.default : imported
    } catch (e: any) {
        if (e.code === 'ERR_REQUIRE_ESM') {
            throw new Error(
                `Your project is an ESM project (you have "type": "module" set in your package.json) but your LayerZero config file uses the .js extension.`
            )
        }

        throw e
    }
}

export function parseConfig(configFileName: string): OpsUserConfig {
    const configFilePath = path.dirname(configFileName)
    const userConfig = loadConfig(configFileName)
    let workspacePaths = (userConfig.workspaces || []).map((x) => path.join(configFilePath, x))
    const bundlesConfig = userConfig.bundles || []
    bundlesConfig.forEach((bundleConfig) => {
        bundleConfig.__workspacePath__ = configFilePath
    })
    const extenders = userConfig.extenders || []

    while (workspacePaths.length > 0) {
        const workspacePath = workspacePaths.shift()
        if (workspacePath === undefined) {
            throw new Error('workspacePath is undefined')
        }
        const workspaceConfig = parseConfig(findConfigPath({ cwd: workspacePath, stopAt: workspacePath }))
        const subWorkspacePaths = (workspaceConfig.workspaces || []).map((x) => path.join(workspacePath, x))

        workspacePaths = [...workspacePaths, ...subWorkspacePaths]
        const subBundles = workspaceConfig.bundles || []
        subBundles.forEach((bundleConfig) => {
            bundleConfig.__workspacePath__ = workspacePath
        })
        bundlesConfig.push(...subBundles)

        extenders.push(...(workspaceConfig.extenders || []))
    }

    return {
        ...userConfig,
        extenders: extenders,
        bundles: bundlesConfig,
    }
}

function processUserConfig(userConfig: OpsUserConfig, config: OpsConfig): void {
    if (config.bundles === undefined) {
        config.bundles = []
    }

    for (const project of userConfig.bundles ?? []) {
        if (project.__workspacePath__ === undefined) {
            throw new Error(`__workspacePath__ is not defined for ${project}`)
        }
        const chainTypes = project.chains ? project.chains.map((x) => getChainType(x)) : project.chainTypes
        const processed: OpsBundleConfig = {
            ident: getBundleIdent(project),
            path: path.resolve(project.__workspacePath__, project.path),
            name: project.name,
            tags: project.tags,
            chains: project.chains,
            chainTypes: chainTypes,
            alias: project.alias,
        }
        config.bundles.push(processed)
    }
}

export function buildContext(processors: OpsUserConfigProcessor[]): OpsContext {
    const candidates = [processUserConfig, ...processors]
    return {
        processors: candidates,
    }
}

export function buildEnvironment(context: OpsContext, userConfig: OpsUserConfig, config: OpsConfig): OpsEnvironment {
    for (const processor of context.processors) {
        processor(userConfig, config)
    }

    return {
        userConfig,
        config,
    }
}

/**
 * Returns an array of unique objects based on the specified priority logic.
 *
 * @param bundles
 * @param chain
 * @returns
 */
export function getBundlesForChain(bundles: OpsBundleConfig[], chain: Chain): OpsBundleConfig[] {
    const groupedBundles = _.groupBy(bundles, 'name')

    const filteredBundles = _.flatMap(
        _.map(groupedBundles, (group) => {
            const chainType = getChainType(chain)
            // Exclude bundles with defined chains that do not include the specified chain.
            group = group.filter((bundle) => {
                return bundle.chains === undefined || bundle.chains.includes(chain)
            })

            // Bundles with defined chains and include the specified chain.
            const chainOnlyBundles = group.filter((bundle) => {
                return bundle.chains?.includes(chain)
            })

            // Bundles with defined chainTypes and include the specified chainType.
            const chainTypeOnlyBundles = group.filter((bundle) => {
                return bundle.chainTypes?.includes(chainType)
            })

            // Agnostic bundles
            const agnosticBundles = group.filter((bundle) => {
                const isAgnostic = bundle.chains === undefined && bundle.chainTypes === undefined
                return isAgnostic
            })

            return [chainOnlyBundles.length > 0 ? chainOnlyBundles : chainTypeOnlyBundles, agnosticBundles].flat()
        })
    )

    return filteredBundles
}

type Tags = string[]
/**
 * Filter bundles based on chains, bundle names, and filter criteria
 * @param bundles
 * @param chains
 * @param bundleNames
 * @param tagsGroups
 * @returns
 */
export function filterBundles(
    bundles: OpsBundleConfig[],
    bundleNames: string[],
    tagsGroups: Tags[],
    chains: Chain[]
): OpsBundleConfig[] {
    let candidates: OpsBundleConfig[] = bundles

    // bundles with the specific name
    candidates = candidates.filter((bundle) => bundleNames.length === 0 || bundleNames.includes(bundle.name))

    // bundles meet filters,
    // Need filter tags before by chain
    // For example, there are individual ULNs tagged with 'v1' and 'v2'. If filtered by chain and the results are made unique, only one ULN will be retained
    // Therefore, we should filter by tag before filtering by chain.
    candidates = candidates.filter((bundle) => {
        const matchTagsGroup = (tags: Tags): boolean | undefined => {
            const matchTags = (tags ?? []).every((tag) => bundle.tags.includes(tag))
            return matchTags
        }
        return tagsGroups.length === 0 || tagsGroups.some(matchTagsGroup)
    })

    // bundles available for chains
    if (chains.length !== 0) {
        candidates = _.uniqBy(chains.map((chain) => getBundlesForChain(candidates, chain)).flat(), 'ident')
    }

    return candidates
}
