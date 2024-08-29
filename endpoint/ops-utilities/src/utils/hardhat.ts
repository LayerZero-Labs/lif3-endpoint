import fs from 'fs'
import path from 'path'

import { EtherscanConfig } from '@nomicfoundation/hardhat-verify/types'
import { NetworksUserConfig } from 'hardhat/types'
import { $ } from 'zx'

import '@layerzerolabs/ops-plugin-core'

import {
    ENVIRONMENT,
    EndpointId,
    Environment,
    endpointIdToNetwork,
    networkToChain,
} from '@layerzerolabs/lz-definitions'
import { getProjectPackageManager } from '@layerzerolabs/lz-utilities'

import { ProviderConfig } from '../providers'

export async function hardhatDeploy(
    workspace: string,
    network: string,
    tags: string[],
    options: string[],
    executor?: 'yarn' | 'npm' | 'pnpm'
): Promise<void> {
    // get the package manager from the workspace
    if (executor === undefined) executor = getProjectPackageManager(workspace)
    const args = ['--tags', tags.join(',')]
    try {
        await $({
            cwd: workspace,
            nothrow: true,
            verbose: true,
        })`${executor} hardhat deploy --network ${network} ${args} ${options}`
    } catch (e) {
        console.trace(e)
        throw e
    }
}

export async function hardhatZksyncDeploy(workspace: string, network: string, script: string): Promise<void> {
    const getAllFiles = function (dir: string): string[] {
        const files: string[] = []
        const entries = fs.readdirSync(dir)
        for (const entry of entries) {
            const entryPath = path.join(dir, entry)
            if (fs.lstatSync(entryPath).isDirectory()) {
                files.push(...getAllFiles(entryPath))
            } else {
                files.push(entryPath)
            }
        }
        return files
    }

    const findDeployScripts = function (workDir: string): string[] {
        const deployScriptsDir = path.join(workDir, 'deploy')

        if (!fs.existsSync(deployScriptsDir)) {
            throw new Error('No deploy folder was found')
        }

        return getAllFiles(deployScriptsDir).filter(
            (file) => path.extname(file) == '.ts' || path.extname(file) == '.js'
        )
    }

    const existDeployScript = function (workDir: string, targetScript: string): boolean {
        const scripts = findDeployScripts(workDir)

        let found = false
        for (const script of scripts) {
            if (script.includes(targetScript)) {
                found = true
                break
            }
        }
        return found
    }

    if (!existDeployScript(workspace, script)) {
        console.log(`Script ${script} not found in ${workspace}, skip execution`)
        return
    }
    const executor = getProjectPackageManager(workspace)
    try {
        await $({
            cwd: workspace,
            nothrow: true,
            verbose: true,
        })`${executor} hardhat deploy-zksync --network ${network} --script ${script}`
    } catch (e) {
        console.log(e)
    }
}

export async function hardhatCompile(
    workspace: string,
    network: string,
    options: string[],
    executor?: 'yarn' | 'npm' | 'pnpm'
): Promise<void> {
    if (executor === undefined) executor = getProjectPackageManager(workspace)
    try {
        await $({
            cwd: workspace,
            nothrow: true,
            verbose: true,
        })`${executor} hardhat compile --network ${network} ${options}`
    } catch (e) {
        console.log(e)
    }
}

/**
 * build a NetworksUserConfig with [network] and [network-local] for the network of each EndpointId,
 * the url of [network] and [network-local] can be overridden by providerConfig
 * @param providerConfig
 * @returns NetworksUserConfig
 */
export function buildHardhatNetworks(providerConfig: ProviderConfig): NetworksUserConfig {
    const networks: NetworksUserConfig = {}
    for (const endpointKey in EndpointId) {
        if (Number(endpointKey) >= 0) {
            const network = endpointIdToNetwork(parseInt(endpointKey))

            const chain = networkToChain(network)
            const env = ENVIRONMENT[endpointKey as unknown as EndpointId]

            {
                const url = providerConfig[env]?.[chain]
                if (url !== undefined && !(network in networks)) {
                    networks[network] = { url: typeof url === 'string' ? url : url.url }
                }
            }

            {
                const url = providerConfig[Environment.LOCAL]?.[chain]
                if (url !== undefined && !(`${network}-local` in networks)) {
                    networks[`${network}-local`] = { url: typeof url === 'string' ? url : url.url }
                }
            }
        }
    }
    return networks
}

/**
 * build an EtherscanConfig to declare how to get the apiKey from the environment variables
 * e.g., the apiKey of the ethereum mainnet will read from process.env.ETHERSCAN_API_KEY
 * @returns Partial<EtherscanConfig>
 */
export function buildHardhatEtherScan(): Partial<EtherscanConfig> {
    const retval: Partial<EtherscanConfig> = {
        apiKey: {
            // ethereum
            mainnet: process.env.ETHERSCAN_API_KEY ?? '',
            rinkeby: process.env.ETHERSCAN_API_KEY ?? '',
            // binance smart chain
            bsc: process.env.BSCSCAN_API_KEY ?? '',
            bscTestnet: process.env.BSCSCAN_API_KEY ?? '',
            // fantom mainnet
            opera: process.env.FTMSCAN_API_KEY ?? '',
            ftmTestnet: process.env.FTMSCAN_API_KEY ?? '',
            // optimism
            optimisticEthereum: process.env.OPTIMISMSCAN_API_KEY ?? '',
            optimisticKovan: process.env.OPTIMISMSCAN_API_KEY ?? '',
            // polygon
            polygon: process.env.POLYGONSCAN_API_KEY ?? '',
            polygonMumbai: process.env.POLYGONSCAN_API_KEY ?? '',
            // arbitrum
            arbitrumOne: process.env.ARBISCAN_API_KEY ?? '',
            arbitrumTestnet: process.env.ARBISCAN_API_KEY ?? '',
            // avalanche
            avalanche: process.env.SNOWTRACE_API_KEY ?? '',
            avalancheFujiTestnet: process.env.SNOWTRACE_API_KEY ?? '',
            // moonbeam
            moonbeam: process.env.MOONBEAM_API_KEY ?? '',
            moonbaseAlpha: process.env.MOONBEAM_API_KEY ?? '',
        },
    }

    return retval
}
