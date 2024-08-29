import { EndpointVersion } from '@layerzerolabs/lz-definitions'
import { Deployment } from '@layerzerolabs/lz-utilities'

import { configValueToAddress } from './config-utils'

describe('configValueToAddress', () => {
    it('success convert evm address', () => {
        const expectedAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
        const address = configValueToAddress('ethereum-mainnet', expectedAddress, [])
        expect(expectedAddress).toEqual(address)
    })

    it('success convert tron hex address', () => {
        const tronAddress = '41f39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
        const expectedAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
        const address = configValueToAddress('tron-mainnet', tronAddress, [])
        expect(expectedAddress).toEqual(address)
    })

    it('success convert tron base58 address', () => {
        const tronAddress = 'TYBNgWfhGuNzdLtjKtxXTfskAhTbMcqbaG'
        const expectedAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
        const address = configValueToAddress('tron-mainnet', tronAddress, [])
        expect(expectedAddress).toEqual(address)
    })

    it('fail if invalid address', () => {
        const invalidAddress = 'invalid-address'
        expect(() => configValueToAddress('ethereum-mainnet', invalidAddress, [])).toThrow()
    })

    it('success convert contract address old style', () => {
        const addressSymbol = '@layerzerolabs/lz-evm-sdk-v1/UltraLightNodeV2'
        const expectedAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
        const deployments: Deployment[] = [
            {
                name: 'UltraLightNodeV2',
                address: expectedAddress,
                source: '@layerzerolabs/lz-evm-sdk-v1',
                network: 'ethereum-mainnet',
                compatibleVersions: [EndpointVersion.V1],
            },
        ]
        const address = configValueToAddress('ethereum-mainnet', addressSymbol, deployments)
        expect(expectedAddress).toEqual(address)
    })

    it('success convert contract address style', () => {
        const addressSymbol = '@layerzerolabs/lz-evm-sdk-v1|UltraLightNodeV2'
        const expectedAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
        const deployments: Deployment[] = [
            {
                name: 'UltraLightNodeV2',
                address: expectedAddress,
                source: '@layerzerolabs/lz-evm-sdk-v1',
                network: 'ethereum-mainnet',
                compatibleVersions: [EndpointVersion.V1],
            },
        ]
        const address = configValueToAddress('ethereum-mainnet', addressSymbol, deployments)
        expect(expectedAddress).toEqual(address)
    })

    it('fail if contract not found', () => {
        const addressSymbol = '@layerzerolabs/lz-evm-sdk-v1|UltraLightNodeV2'
        const deployments: Deployment[] = []
        expect(() => configValueToAddress('ethereum-mainnet', addressSymbol, deployments)).toThrow()
    })
})
