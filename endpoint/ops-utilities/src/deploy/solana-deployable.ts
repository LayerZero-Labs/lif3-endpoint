import * as fs from 'fs'
import * as path from 'path'

import { globSync } from 'glob'

import {
    Chain,
    EndpointVersion,
    Network,
    chainAndStageToNetwork,
    isSolanaChain,
    networkToChain,
} from '@layerzerolabs/lz-definitions'
import '@layerzerolabs/ops-plugin-core'
import { CompileOption, DeployOption, Deployable, Deployment } from '@layerzerolabs/ops-core'

import { solanaCompile, solanaDeploy } from '../utils'

import { CompatibleVersionsType } from './utils'

/**
 * SolanaDeployable is a deployable that uses `solana program deploy ...` command to deploy programs.
 */
export class SolanaDeployable implements Deployable {
    private readonly defaultCompatibleVersions: CompatibleVersionsType

    /**
     *
     * @param workspace the abs path of the solana project `@layerzerolabs/layerzero-v2-solana-ops`
     * @param deploymentPackageRoot the abs path of the deployment workspace, generally SDK workspace
     * @param programs the program name, like `endpoint, simple_messagelib, uln, blocked_messagelib`
     */
    constructor(
        private readonly workspace: string,
        private readonly deploymentPackageRoot: string,
        private readonly programs: string[],
        private readonly useAnchor = false
    ) {
        this.defaultCompatibleVersions = { default: [EndpointVersion.V2] }
    }

    async compile(option: CompileOption): Promise<void> {
        const network = chainAndStageToNetwork(Chain.SOLANA, option.stage, option.env)
        await Promise.all(
            this.programs.map(async (program) => {
                return solanaCompile(this.workspace, network, this.useAnchor, program, option.options ?? [])
            })
        )
    }

    async deploy(option: DeployOption): Promise<Deployment[]> {
        if (option.chains.length !== 1) {
            throw new Error('SolanaDeployable only supports one chain')
        }
        const chain = option.chains[0]
        const network = chainAndStageToNetwork(chain, option.stage, option.env)
        await solanaDeploy(network, this.workspace, this.useAnchor, this.programs)
        return this.getDeployments([network], this.programs)
    }

    async getDeployments(networks: Network[], programs?: string[]): Promise<Deployment[]> {
        const deployments: Deployment[] = []
        for (const network of networks) {
            const chain = networkToChain(network)
            if (!isSolanaChain(chain)) {
                continue
            }
            const deployFiles = globSync(
                path.join(this.deploymentPackageRoot, 'deployments', network, '!(*-keypair).json')
            )
            const packageJson = JSON.parse(
                fs.readFileSync(path.join(this.deploymentPackageRoot, 'package.json'), 'utf-8')
            ) as { name: string }
            for (const deployFile of deployFiles) {
                const { address, name, compatibleVersions } = JSON.parse(fs.readFileSync(deployFile, 'utf-8')) as {
                    address: string
                    name: string
                    compatibleVersions: EndpointVersion[]
                }
                if (programs && !programs.includes(name)) {
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
