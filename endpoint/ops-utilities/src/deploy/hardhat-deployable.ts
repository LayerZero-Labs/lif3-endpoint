import * as fs from 'fs'
import * as path from 'path'

import { globSync } from 'glob'

import { EndpointVersion, Network, chainAndStageToNetwork } from '@layerzerolabs/lz-definitions'
import '@layerzerolabs/ops-plugin-core'
import { CompileOption, DeployOption, Deployable, Deployment, DeploymentFetcher } from '@layerzerolabs/ops-core'

import { hardhatCompile, hardhatDeploy } from '../utils'

import { CompatibleVersionsType, extractContractCompatibleVersions } from './utils'

/**
 * HardhatDeployable is a deployable that uses hardhat to deploy contracts.
 * It can also fetch deployments from hardhat-deploy.
 */
export class HardhatDeployable implements Deployable {
    private readonly defaultCompatibleVersions: CompatibleVersionsType

    /**
     *
     * @param workspace the path of the Hardhat project
     * @param tags specify which deploy script to execute via tags
     * @param fetcher which is used to fetch deployments
     */
    constructor(
        private readonly workspace: string,
        private readonly tags: string[],
        private readonly fetcher?: DeploymentFetcher
    ) {
        this.defaultCompatibleVersions = { default: [EndpointVersion.V2] }
    }

    async compile(option: CompileOption): Promise<void> {
        for (const chain of option.chains) {
            const network = chainAndStageToNetwork(chain, option.stage, option.env)
            await hardhatCompile(this.workspace, network, option.options ?? [])
        }
    }

    async deploy(option: DeployOption): Promise<Deployment[]> {
        process.env.STAGE = option.stage
        try {
            const deployPromises = option.chains.map(async (chain) => {
                const network = chainAndStageToNetwork(chain, option.stage, option.env)
                await hardhatDeploy(this.workspace, network, this.tags, option.options ?? ['--no-compile'])
                return this.getDeployments([network])
            })
            return (await Promise.all(deployPromises)).flat()
        } finally {
            delete process.env.STAGE
        }
    }

    async getDeployments(networks: Network[]): Promise<Deployment[]> {
        if (this.fetcher) {
            return this.fetcher.getDeployments(networks)
        } else {
            const deployments: Deployment[] = []
            const packageJSON = JSON.parse(fs.readFileSync(path.join(this.workspace, 'package.json'), 'utf-8'))
            const packageName = packageJSON.name
            let compatibleVersions = this.defaultCompatibleVersions
            if (packageJSON.lzVersions) {
                compatibleVersions = packageJSON.lzVersions as CompatibleVersionsType
            }
            for (const network of networks) {
                const deployFiles = globSync(path.join(this.workspace, 'deployments', network, '*.json'))
                for (const deployFile of deployFiles) {
                    const { address, abi, bytecode } = JSON.parse(fs.readFileSync(deployFile, 'utf-8'))
                    const name = path.basename(deployFile).replace('.json', '')
                    deployments.push({
                        name,
                        address,
                        abi,
                        bytecode,
                        source: packageName,
                        network,
                        compatibleVersions: extractContractCompatibleVersions(name, compatibleVersions),
                    })
                }
            }
            return deployments
        }
    }
}
