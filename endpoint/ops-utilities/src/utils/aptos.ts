import { $ } from 'zx'

import { getProjectPackageManager } from '@layerzerolabs/lz-utilities'

export async function aptosDeploy(
    workspace: string,
    network: string,
    modules: string[],
    options: string[],
    executor?: 'yarn' | 'npm' | 'pnpm'
): Promise<void> {
    // get the package manager from the workspace
    if (executor === undefined) executor = getProjectPackageManager(workspace)
    try {
        await $({
            cwd: workspace,
            nothrow: true,
            verbose: true,
        })`${executor} lz-aptos-cli deploy -n ${network} -m ${modules} ${options}`
    } catch (e) {
        console.trace(e)
        throw e
    }
}

export async function aptosCompile(
    workspace: string,
    network: string,
    modules: string[],
    options: string[],
    executor?: 'yarn' | 'npm' | 'pnpm'
): Promise<void> {
    // get the package manager from the workspace
    if (executor === undefined) executor = getProjectPackageManager(workspace)
    try {
        await $({
            cwd: workspace,
            nothrow: true,
            verbose: true,
        })`${executor} lz-aptos-cli build -n ${network} -m ${modules} ${options}`
    } catch (e) {
        console.trace(e)
        throw e
    }
}
