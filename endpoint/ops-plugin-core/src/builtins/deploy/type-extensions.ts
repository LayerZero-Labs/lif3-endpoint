import { Chain, EndpointVersion, Environment, Network, Stage } from '@layerzerolabs/lz-definitions'
import { Deployment as D } from '@layerzerolabs/lz-utilities'

declare module '@layerzerolabs/ops-core' {
    export interface OpsBundleUserConfig {
        deploy?: {
            /**
             * The order of deployment. The lower the number, the earlier the deployment.
             */
            order?: number
            /**
             * The deployer to complete the deployment.
             */
            deployer: Deployable | string
            options?: { [key: string]: any }
            skip?: boolean
            dependencies?: string[]
        }
    }

    export interface OpsBundleConfig {
        deploy?: {
            order: number
            deployer: Deployable
            options: { [key: string]: any }
            skip: boolean
            dependencies: string[]
        }
    }
}

declare module '@layerzerolabs/ops-core' {
    export interface DeployOption {
        overwrite: boolean // TODO need to remove
        chains: Chain[]
        stage: Stage
        env: Environment
        version?: EndpointVersion // TODO(gx): we don't need this member?
        options?: string[]
    }

    export interface CompileOption {
        chains: Chain[]
        stage: Stage
        env: Environment
        options?: string[]
    }

    export type Deployment = D

    export type DeployDeployment = { [chain in Chain]?: Deployment[] }

    export interface Deployable {
        compile(option: CompileOption): Promise<void>

        preDeploy?(option: DeployOption): Promise<void>

        deploy(option: DeployOption): Promise<Deployment[]>

        postDeploy?(option: DeployOption): Promise<void>

        getDeployments(networks: Network[]): Promise<Deployment[]>
    }

    export type DeploymentFetcher = Pick<Deployable, 'getDeployments'>
}
