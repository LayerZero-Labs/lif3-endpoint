import fs from 'fs'
import path from 'path'

import { globSync } from 'glob'

import { Network } from '@layerzerolabs/lz-definitions'
import { Deployment } from '@layerzerolabs/lz-utilities'
import { CompileOption, DeployOption, Deployable, DeploymentFetcher } from '@layerzerolabs/ops-core'

import { CompatibleVersionsType, extractContractCompatibleVersions } from './utils'

export abstract class BaseAptosDeployable implements Deployable {
    constructor(
        protected readonly workspace: string,
        protected readonly defaultCompatibleVersions: CompatibleVersionsType,
        protected readonly fetcher?: DeploymentFetcher
    ) {}

    abstract deploy(option: DeployOption): Promise<Deployment[]>

    public async compile(option: CompileOption): Promise<void> {}

    writeDeployments(network: Network, deployments: { name: string; address: string }[]): void {
        for (const deployment of deployments) {
            const dir = path.join(this.workspace, 'deployments', network)
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
            }
            const deployFile = path.join(dir, `${deployment.name}.json`)
            fs.writeFileSync(deployFile, JSON.stringify({ address: deployment.address }, null, 2))
        }
    }

    async getDeployments(networks: Network[]): Promise<Deployment[]> {
        if (this.fetcher) {
            return await this.fetcher.getDeployments(networks)
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
