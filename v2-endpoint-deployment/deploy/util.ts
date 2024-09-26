import * as fs from 'fs'
import * as path from 'path'

import { HardhatRuntimeEnvironment } from 'hardhat/types'

export const ADDRESS_ONE = '0x0000000000000000000000000000000000000001'
const EVM07ROOT = path.dirname(require.resolve('@layerzerolabs/lz-evm-v1-0.7/package.json'))

export function getDeployedAddress(hre: HardhatRuntimeEnvironment, contractName: string): string {
    let networkName = hre.network.name
    if (networkName === 'hardhat') {
        networkName = 'localhost'
    }
    const data = require(`../deployments/${networkName}/${contractName}.json`)
    return data.address
}

export function getDeployedV1Address(hre: HardhatRuntimeEnvironment, contractName: string): string {
    // relative to packages/layerzero-v1/evm/sdk, just don't want to add dependency to v1 sdk
    let networkName = hre.network.name
    if (networkName === 'hardhat') {
        networkName = 'localhost'
    }
    const data = require(`../../v1-endpoint-deployment/deployments/${networkName}/${contractName}.json`)
    return data.address
}

export function tryGetDeployedV1Address(hre: HardhatRuntimeEnvironment, contractName: string): string | undefined {
    try {
        return getDeployedV1Address(hre, contractName)
    } catch (e) {
        return undefined
    }
}

export function getEndpointV1Address(hre: HardhatRuntimeEnvironment): string {
    // TODO, compatible with zksync
    let networkName = hre.network.name
    if (networkName === 'hardhat') {
        networkName = 'localhost'
    }
    const v1EndpointJson = `${EVM07ROOT}/deployments/${networkName}/Endpoint.json`
    // when doing e2e testing(301-302), should deploy endpoint-v1 first
    if (fs.existsSync(v1EndpointJson)) {
        const v1Endpoint = JSON.parse(fs.readFileSync(v1EndpointJson, 'utf-8').toString())
        if (!v1Endpoint.address || v1Endpoint.address === '') {
            throw new Error('Endpoint address not found')
        }
        return v1Endpoint.address
    }
    return ADDRESS_ONE // in case of only endpoint-v2 for local/testnet, mainnet should always have endpoint-v1
}

export function getUltraLightNodeV2Address(hre: HardhatRuntimeEnvironment): string {
    let networkName = hre.network.name
    if (networkName === 'hardhat') {
        networkName = 'localhost'
    }
    const ultraLightNodeV2Json = `../../v1-endpoint-deployment/deployments/${networkName}/UltraLightNodeV2.json`
    if (fs.existsSync(ultraLightNodeV2Json)) {
        const ultraLightNodeV2 = JSON.parse(fs.readFileSync(ultraLightNodeV2Json, 'utf-8').toString())
        if (!ultraLightNodeV2.address || ultraLightNodeV2.address === '') {
            throw new Error('UltraLightNodeV2 address not found')
        }
        return ultraLightNodeV2.address
    }
    return ''
}

export function getUltraLightNodeV2AltTokenAddress(hre: HardhatRuntimeEnvironment): string {
    let networkName = hre.network.name
    if (networkName === 'hardhat') {
        networkName = 'localhost'
    }
    const ultraLightNodeV2AltTokenJson = `${EVM07ROOT}/deployments/${networkName}/UltraLightNodeV2AltToken.json`
    if (fs.existsSync(ultraLightNodeV2AltTokenJson)) {
        const ultraLightNodeV2AltToken = JSON.parse(fs.readFileSync(ultraLightNodeV2AltTokenJson, 'utf-8').toString())
        if (!ultraLightNodeV2AltToken.address || ultraLightNodeV2AltToken.address === '') {
            throw new Error('UltraLightNodeV2AltToken address not found')
        }
        return ultraLightNodeV2AltToken.address
    }
    return ''
}
