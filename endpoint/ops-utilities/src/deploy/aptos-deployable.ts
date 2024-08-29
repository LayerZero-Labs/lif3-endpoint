import * as fs from 'fs'
import * as path from 'path'

import { globSync } from 'glob'

import { Chain, EndpointVersion, Network, chainAndStageToNetwork, networkToChain } from '@layerzerolabs/lz-definitions'
import '@layerzerolabs/ops-plugin-core'
import { CompileOption, DeployOption, Deployable, Deployment } from '@layerzerolabs/ops-core'

import { aptosCompile, aptosDeploy } from '../utils'

/**
 * AptosDeployable is a deployable that uses `lz-aptos-cli build ...` and `lz-aptos-cli deploy ...` commands to compile/deploy programs.
 */
export class AptosDeployable implements Deployable {
    /**
     *
     * @param opsWorkspace the abs path of the Aptos ops project which contains the `lz-aptos` package and the `lz-aptos.config.ts`
     * @param sdkWorkspace the abs path of the deployment workspace, generally SDK workspace
     * @param modules the modules name, like `endpoint, executor`
     */
    constructor(
        private readonly opsWorkspace: string,
        private readonly sdkWorkspace: string,
        private readonly modules: string[]
    ) {}

    async compile(option: CompileOption): Promise<void> {
        const network = chainAndStageToNetwork(Chain.APTOS, option.stage, option.env)
        await aptosCompile(this.opsWorkspace, network, this.modules, option.options ?? [])
    }

    async deploy(option: DeployOption): Promise<Deployment[]> {
        if (option.chains.length !== 1) {
            throw new Error('AptosDeployable only supports one chain')
        }
        const chain = option.chains[0]
        const network = chainAndStageToNetwork(chain, option.stage, option.env)
        await aptosDeploy(this.opsWorkspace, network, this.modules, option.options ?? [])
        const deployments = this.getDeployments([network], this.modules)
        return deployments
    }

    // children class can override this method to do post deploy work
    async postDeploy(option: DeployOption): Promise<void> {
        return Promise.resolve()
    }

    async getDeployments(networks: Network[], programs?: string[]): Promise<Deployment[]> {
        const deployments: Deployment[] = []
        for (const network of networks) {
            const chain = networkToChain(network)
            if (chain !== Chain.APTOS) {
                continue
            }
            const deployFiles = globSync(path.join(this.sdkWorkspace, 'deployments', network, '!(*-keypair).json'))
            const packageJson = JSON.parse(fs.readFileSync(path.join(this.sdkWorkspace, 'package.json'), 'utf-8')) as {
                name: string
            }
            for (const deployFile of deployFiles) {
                const { address, name, moduleName, compatibleVersions } = JSON.parse(
                    fs.readFileSync(deployFile, 'utf-8')
                ) as {
                    address: string
                    name: string
                    moduleName: string
                    compatibleVersions: EndpointVersion[]
                }
                if (programs && !programs.includes(moduleName)) {
                    continue
                }
                deployments.push({
                    name,
                    address,
                    network,
                    source: packageJson.name,
                    compatibleVersions: compatibleVersions,
                })
            }
        }
        return Promise.resolve(deployments)
    }
}
