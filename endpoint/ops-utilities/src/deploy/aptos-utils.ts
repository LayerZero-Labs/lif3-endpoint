import * as fs from 'fs'
import * as path from 'path'

import * as aptos from 'aptos'
import Locker from 'node-file-lock'
import { $ } from 'zx'

import { sleep } from '@layerzerolabs/lz-utilities'

const INCLUDE_ARTIFACTS = 'none' //none,sparse,all

export async function compileAndGetMetaModules(
    packagePath: string,
    namedAddresses: { [key: string]: string },
    moduleNames: string[],
    packageName?: string
): Promise<{ metadata: Uint8Array; modules: aptos.TxnBuilderTypes.Module[] }> {
    // in order to support parallel testing and don't make the output files r/w conflict, add locker here
    // add try-catch to make sure unlock the locker
    const locker = await syncGetLocker(packagePath)
    try {
        await compilePackage(packagePath, packagePath, namedAddresses)
        console.log(`compile package done`)
        const data = getMetadataAndModules(packagePath, packagePath, moduleNames, packageName)
        locker.unlock()
        return data
    } catch (err) {
        locker.unlock()
        throw err
    }
}

// warning: don't forget to call unlock!!!
async function syncGetLocker(packagePath: string): Promise<Locker> {
    let locker: Locker | undefined
    // loop until get the lock
    while (locker == undefined) {
        try {
            locker = new Locker(path.join(packagePath, 'compile.lock'))
        } catch (err) {
            await sleep(500)
        }
    }
    return locker
}

export async function compilePackage(
    packagePath: string,
    outputPath: string,
    namedAddresses: { [key: string]: string }
): Promise<void> {
    const addresses = Object.keys(namedAddresses)
        .map((key) => `${key}=${namedAddresses[key]}`)
        .join(',')
    const options = [
        '--included-artifacts',
        INCLUDE_ARTIFACTS,
        '--save-metadata',
        '--package-dir',
        packagePath,
        '--output-dir',
        outputPath,
        '--named-addresses',
        addresses,
    ]
    console.log(`command: aptos move compile ${options.join(' ')}`)
    await $`aptos move compile ${options}`
}

export function getMetadataAndModules(
    packagePath: string,
    outputPath: string,
    moduleNames: string[],
    packageName?: string
): { metadata: Uint8Array; modules: aptos.TxnBuilderTypes.Module[] } {
    let dirName: string
    if (packageName !== undefined) {
        dirName = packageName
    } else {
        dirName = packagePath.split('/').pop()!.replace(new RegExp('-', 'g'), '_')
    }

    // metadata is under build path
    const metadataPath = path.join(packagePath, `build/${dirName}/package-metadata.bcs`)
    // modules are under output path
    const modulePath = path.join(outputPath, `build/${dirName}/bytecode_modules`)
    const metadata = Uint8Array.from(fs.readFileSync(metadataPath))
    const modules = moduleNames.map(
        (f) => new aptos.TxnBuilderTypes.Module(Uint8Array.from(fs.readFileSync(path.join(modulePath, f))))
    )
    return { metadata, modules }
}

export async function getDeployedModules(client: aptos.AptosClient, address: aptos.MaybeHexString): Promise<string[]> {
    const modules = await client.getAccountModules(address)
    return modules
        .map((m) => {
            return m.abi
        })
        .filter((m) => m !== undefined)
        .map((m) => {
            return m!.name
        })
}

export async function initialDeploy(
    client: aptos.AptosClient,
    address: aptos.MaybeHexString,
    moduleNames: string[]
): Promise<boolean> {
    const checkModules = moduleNames.map((m) => m.replace('.mv', ''))
    const accountModules = await getDeployedModules(client, address)
    const modules = accountModules.filter((m) => checkModules.includes(m))
    return modules.length === 0
}
