import { Chain, ChainType, Stage } from '@layerzerolabs/lz-definitions'
import { Configurable, Deployable, Executable, OpsBundleUserConfig } from '@layerzerolabs/ops-core'
import { isExecutable } from '@layerzerolabs/ops-plugin-core'

export interface BaseBundle {
    /**
     * The name of the project, multiple project can share the same name.
     */
    name: string

    /**
     * The path of the project.
     */
    path: string

    /**
     * The tags of the project, it will be used to filter the bundles.
     */
    tags: string[]

    chains?: Chain[]
    chainTypes?: ChainType[]
    deployer?: Deployable
    configurator?: Configurable
    bin?: Executable | string
    stage?: Stage

    /**
     * The order of deployment. The lower the number, the earlier the deployment.
     */
    deployOrder?: number

    /**
     * The unique alias of the project, it will be used in `requirements`.
     */
    alias?: string

    /**
     * The dependencies of the project to get the deployments.
     */
    requirements?: string[]

    skipConfig?: boolean
    skipDeploy?: boolean
    /**
     * The dependencies should be deployed before this project. Tags and names are supported.
     */
    deployDependencies?: string[]
    /**
     * The dependencies should be configured before this project. Tags and names are supported.
     */
    configDependencies?: string[]
}

export interface SolanaBundle extends BaseBundle {
    deploymentPackage: string
}

export interface HardhatBundle extends BaseBundle {
    options: {
        /**
         * The tags of deploy scripts to be executed by Hardhat deploy
         */
        deployTags?: string[]
    }
}

export interface ZksyncBundle extends BaseBundle {
    options: {
        /**
         * The scripts to deploy the contracts
         */
        scripts?: string[]
    }
}

export interface AptosBundle extends BaseBundle {
    modules?: string[]
}

export function buildBundle(config: HardhatBundle | ZksyncBundle | SolanaBundle | AptosBundle): OpsBundleUserConfig {
    const retval: OpsBundleUserConfig = {
        alias: config.alias,
        name: config.name,
        path: config.path,
        tags: config.tags,
        chains: config.chains,
        chainTypes: config.chainTypes,
        deploy: config.deployer
            ? {
                  deployer: config.deployer,
                  options: {},
                  order: config.deployOrder,
                  skip: config.skipDeploy,
                  dependencies: config.deployDependencies,
              }
            : undefined,
        config: config.configurator
            ? {
                  configurator: config.configurator,
                  options: {},
                  requirements: config.requirements,
                  skip: config.skipConfig,
                  dependencies: config.configDependencies,
              }
            : undefined,
        bin: config.bin
            ? {
                  command: typeof config.bin === 'string' ? config.bin : undefined,
                  executer: isExecutable(config.bin) ? config.bin : undefined,
                  options: typeof config.bin === 'string' ? { shell: true } : {},
              }
            : undefined,
    }
    return retval
}
