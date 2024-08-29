import fs from 'fs'

import { ethers } from 'ethers'
import * as yaml from 'js-yaml'
import TronWeb from 'tronweb'

import { ChainType, Environment, Network, networkToChainType } from '@layerzerolabs/lz-definitions'
import { findDeployment } from '@layerzerolabs/lz-utilities'
import { Deployment } from '@layerzerolabs/ops-core'

import { ProviderConfig, ProviderSetting } from '../providers'
import { SignerConfig } from '../signers'

export function configValueToAddress(network: Network, config: string, deployments: Deployment[]): string {
    const chainType = networkToChainType(network)
    switch (chainType) {
        case ChainType.EVM: {
            return convertToEvmAddress(network, config, deployments)
        }
        case ChainType.SOLANA: {
            return convertToSolanaAddress(network, config, deployments)
        }
        case ChainType.APTOS: {
            return convertToAptosAddress(network, config, deployments)
        }
        case ChainType.UNKNOWN: {
            throw new Error('Unknown chain type')
        }
        default: {
            throw new Error('Unknown chain type')
        }
    }
}

export function configValueToAddresses(network: Network, values: string[], deployments: Deployment[]): string[] {
    return values.map((value) => configValueToAddress(network, value, deployments))
}

export function hexZeroPadTo32(addr: string): string {
    return ethers.utils.hexZeroPad(addr, 32)
}

export function configValueToAddressBytes32(network: Network, value: string, deployments: Deployment[]): Uint8Array {
    const chainType = networkToChainType(network)
    switch (chainType) {
        case ChainType.EVM: {
            const address = configValueToAddress(network, value, deployments)
            return ethers.utils.arrayify(hexZeroPadTo32(address))
        }
        case ChainType.SOLANA: {
            const address = configValueToAddress(network, value, deployments)
            try {
                return ethers.utils.base58.decode(address)
            } catch (e) {
                throw new Error(`Can't convert "${value}" to SOLANA address in ${network}`)
            }
        }
        case ChainType.APTOS: {
            throw new Error('Not implemented')
        }
        case ChainType.UNKNOWN: {
            throw new Error('Unknown chain type')
        }
        default: {
            throw new Error('Unknown chain type')
        }
    }
}

export function readUrlsByEnv(_env: Environment, nodeUrlPath: string): { [chain: string]: ProviderSetting } {
    const urls = readNodeUrls(nodeUrlPath)

    if (!urls[_env]) {
        throw new Error(`No urls for environment ${_env}`)
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return urls[_env]!
}

let urls: ProviderConfig | undefined

export function readNodeUrls(nodeUrlPath: string): ProviderConfig {
    if (urls === undefined) {
        const content = fs.readFileSync(nodeUrlPath, 'utf8')
        urls = JSON.parse(content) as ProviderConfig
    }
    return urls
}

// { [name: string]: Key | string } | undefined
let accountsConfig: SignerConfig | undefined

export function readAccountsConfig(keysPath: string): SignerConfig {
    if (accountsConfig === undefined) {
        const content = fs.readFileSync(keysPath, 'utf8')
        accountsConfig = yaml.load(content) as SignerConfig
    }
    return accountsConfig
}

export function parseUnit(amount: string, decimals?: number): string {
    return ethers.utils.parseUnits(amount, decimals).toString()
}

function convertToEvmAddress(network: Network, config: string, deployments: Deployment[]): string {
    // compatible with old style: packageName/contractName
    if (!config.includes('|') && config.includes('/')) {
        // only replace last / to |
        config = config.replace(/\/(?!.*\/)/, '|')
    }

    // check if it's a valid address if it's a pure address
    if (!config.includes('|')) {
        config = config.replace(/^41/, '0x') // tron address begin with 41, convert to 0x
        // check evm address
        if (ethers.utils.isAddress(config)) {
            return ethers.utils.getAddress(config)
        }
        // check tron base58 address
        try {
            const toAddr = TronWeb.address.toHex(config).replace(/^41/, '0x')
            if (ethers.utils.isAddress(toAddr)) {
                return ethers.utils.getAddress(toAddr)
            }
        } catch (e) {
            // not tron address
        }
    }

    // style: packageName|contractName
    const parts = config.split('|')
    if (parts.length !== 2) {
        throw new Error(`Can't convert "${config}" to EVM address in ${network}`)
    }
    const packageName = parts[0]
    const contractName = parts[1]

    const deployment = findDeployment(deployments, contractName, { network, source: packageName })
    if (deployment && deployment.source === packageName) {
        return deployment.address
    } else {
        throw new Error(`Can't find deployment for ${contractName} in ${packageName}`)
    }
}

const solanaAddressRegex = /^([1-9A-HJ-NP-Za-km-z]{32,44})$/

function isSolanaAddress(address: string): boolean {
    return solanaAddressRegex.test(address)
}

function convertToSolanaAddress(network: Network, config: string, deployments: Deployment[]): string {
    // compatible with old style: packageName/contractName
    if (!config.includes('|') && config.includes('/')) {
        // only replace last / to |
        config = config.replace(/\/(?!.*\/)/, '|')
    }

    // check if it's a valid address if it's a pure address
    if (!config.includes('|')) {
        if (isSolanaAddress(config)) {
            return config
        }
    }

    // style: packageName|contractName
    const parts = config.split('|')
    if (parts.length !== 2) {
        throw new Error(`Can't convert "${config}" to Solana address in ${network}`)
    }
    const packageName = parts[0]
    const contractName = parts[1]
    const deployment = findDeployment(deployments, contractName, { network, source: packageName })
    if (deployment && deployment.source === packageName) {
        return deployment.address
    } else {
        throw new Error(`Can't find Solana deployment for ${contractName} in ${packageName} ${network}`)
    }
}

function convertToAptosAddress(network: Network, config: string, deployments: Deployment[]): string {
    // compatible with old style: packageName/contractName
    if (!config.includes('|') && config.includes('/')) {
        // only replace last / to |
        config = config.replace(/\/(?!.*\/)/, '|')
    }

    // check if it's a valid address if it's a pure address
    if (!config.includes('|')) {
        // check evm address
        if (ethers.utils.isAddress(config)) {
            return ethers.utils.getAddress(config)
        }
    }

    // style: packageName|contractName
    const parts = config.split('|')
    if (parts.length !== 2) {
        throw new Error(`Can't convert "${config}" to EVM address in ${network}`)
    }
    const packageName = parts[0]
    const contractName = parts[1]

    const deployment = findDeployment(deployments, contractName, { network, source: packageName })
    if (deployment && deployment.source === packageName) {
        return deployment.address
    } else {
        throw new Error(`Can't find deployment for ${contractName} in ${packageName}`)
    }
}
