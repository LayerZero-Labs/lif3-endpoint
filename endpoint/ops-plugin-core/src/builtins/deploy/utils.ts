import './type-extensions'

import * as commander from 'commander'
import { $ } from 'zx'

import {
    CompileOption,
    DeployOption,
    Deployable,
    Deployment,
    OpsBundleConfig,
    OpsConfig,
    OpsEnvironment,
    OpsUserConfig,
    getBundleIdent,
} from '@layerzerolabs/ops-core'

import root from './command'

export const DEFAULT_DEPLOY_ORDER = 65535

export function processConfig(userConfig: Readonly<OpsUserConfig>, config: OpsConfig): void {
    for (const bundle of userConfig.bundles ?? []) {
        if (bundle.deploy === undefined) {
            continue
        }

        const deployer = ((value): Deployable => (typeof value === 'string' ? new CommandDeployable(value) : value))(
            bundle.deploy.deployer
        )

        if (!isDeployable(deployer)) {
            throw new Error(`the deployer of ${bundle.name} is not deployable`)
        }

        const ident = getBundleIdent(bundle)
        const target = config.bundles.find((p) => p.ident === ident)
        if (target === undefined) {
            continue
        }

        target.deploy = {
            order: bundle.deploy.order ?? DEFAULT_DEPLOY_ORDER,
            deployer: deployer,
            options: bundle.deploy.options ?? {},
            skip: bundle.deploy.skip ?? false,
            dependencies: bundle.deploy.dependencies ?? [],
        }
    }
}

export class CommandDeployable implements Deployable {
    constructor(private readonly command: string) {}

    async compile(_option: CompileOption): Promise<void> {
        return Promise.resolve()
    }

    async deploy(_option: DeployOption): Promise<Deployment[]> {
        // TODO: support interactive by inheriting stdio
        $.sync`${this.command}`
        return Promise.resolve([])
    }

    async getDeployments(): Promise<Deployment[]> {
        return Promise.resolve([])
    }
}

export function buildCommandFamily(env: OpsEnvironment): commander.Command[] {
    root.setOptionValue('__CONTEXT__', env)
    // @ts-expect-error TS2322 Command type doesn't matter here
    return [root]
}

export function isDeployable(obj: unknown): obj is Deployable {
    if (obj === undefined || obj === null) {
        return false
    }
    if (typeof obj !== 'object') {
        return false
    }
    return (
        'deploy' in obj &&
        typeof obj.deploy === 'function' &&
        'getDeployments' in obj &&
        typeof obj.getDeployments === 'function'
    )
}

export function getDeployOrder(project: OpsBundleConfig): number {
    return project.deploy?.order ?? DEFAULT_DEPLOY_ORDER
}
