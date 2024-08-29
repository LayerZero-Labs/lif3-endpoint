import * as fs from 'fs'
import * as path from 'path'

import { globSync } from 'glob'

import { EndpointVersion, Network, chainAndStageToNetwork } from '@layerzerolabs/lz-definitions'
import '@layerzerolabs/ops-plugin-core'
import { CompileOption, DeployOption, Deployable, Deployment, DeploymentFetcher } from '@layerzerolabs/ops-core'

import { hardhatCompile, hardhatZksyncDeploy } from '../utils/hardhat'

export class ZksyncDeployable implements Deployable {
    constructor(
        private readonly workspace: string,
        private readonly scripts: string[],
        private readonly fetcher?: DeploymentFetcher
    ) {}

    async compile(option: CompileOption): Promise<void> {
        for (const chain of option.chains) {
            const network = chainAndStageToNetwork(chain, option.stage, option.env)
            await hardhatCompile(this.workspace, network, option.options ?? [])
        }
    }

    async deploy(option: DeployOption): Promise<Deployment[]> {
        process.env.STAGE = option.stage
        try {
            const promises = option.chains.map(async (chain) => {
                const network = chainAndStageToNetwork(chain, option.stage, option.env)
                for (const script of this.scripts) {
                    await hardhatZksyncDeploy(this.workspace, network, `${this.workspace}/${script}`)
                }
                return this.getDeployments([network])
            })
            return (await Promise.all(promises)).flat()
        } finally {
            delete process.env.STAGE
        }
    }

    async getDeployments(networks: Network[]): Promise<Deployment[]> {
        if (this.fetcher) {
            return this.fetcher.getDeployments(networks)
        } else {
            const deployments: Deployment[] = []
            for (const network of networks) {
                const packageName = JSON.parse(fs.readFileSync(path.join(this.workspace, 'package.json'), 'utf-8')).name
                const deployFiles = globSync(path.join(this.workspace, 'deployments', network, '*.json'))
                for (const deployFile of deployFiles) {
                    const { address, abi, bytecode } = JSON.parse(fs.readFileSync(deployFile, 'utf-8'))
                    deployments.push({
                        name: path.basename(deployFile).replace('.json', ''),
                        address,
                        abi,
                        bytecode,
                        source: packageName,
                        network,
                        // TODO - not sure if this is the right way to do this
                        compatibleVersions: [EndpointVersion.V2],
                    })
                }
            }
            return deployments
        }
    }
}
