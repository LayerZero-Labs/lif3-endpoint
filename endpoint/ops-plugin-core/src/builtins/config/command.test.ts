import { describe } from '@jest/globals'

import { Chain, ChainType, EndpointVersion, getChainType } from '@layerzerolabs/lz-definitions'

import { generateCombinations, processEndpointCriteria } from './command'

describe('command', () => {
    test('generateCombinations', () => {
        const b = generateCombinations([
            [['1'], ['2']],
            [['3'], ['4']],
        ])
        console.log(b)
        expect(b).toEqual([
            [['1'], ['3']],
            [['1'], ['4']],
            [['2'], ['3']],
            [['2'], ['4']],
        ])
    })
    describe('processEndpointCriteria', () => {
        test('v2', () => {
            const endpointCriteria = processEndpointCriteria('v2')
            expect(endpointCriteria).toEqual(
                Object.values(Chain).map((chain) => {
                    const chainType = getChainType(chain)
                    return {
                        chain: chain,
                        chainType: chainType,
                        endpointVersion: EndpointVersion.V2,
                    }
                })
            )
        })
        test('v3', () => {
            expect(() => {
                processEndpointCriteria('v3')
            }).toThrow('invalid endpoint version v3')
        })
        test('ethereum:v2', () => {
            const endpointCriteria = processEndpointCriteria('ethereum:v2')
            expect(endpointCriteria).toEqual({
                chain: Chain.ETHEREUM,
                chainType: ChainType.EVM,
                endpointVersion: EndpointVersion.V2,
            })
        })
        test('ethereum:v3', () => {
            expect(() => {
                processEndpointCriteria('ethereum:v3')
            }).toThrow('invalid endpoint version ethereum:v3')
        })
        test('evm:v2', () => {
            const endpointCriteria = processEndpointCriteria('evm:v2')
            expect(endpointCriteria).toEqual(
                Object.values(Chain)
                    .filter((chain) => {
                        return getChainType(chain) === ChainType.EVM
                    })
                    .map((chain) => {
                        return {
                            chain: chain,
                            chainType: ChainType.EVM,
                            endpointVersion: EndpointVersion.V2,
                        }
                    })
            )
        })
        test('unknown:v2', () => {
            expect(() => {
                processEndpointCriteria('unknown:v2')
            }).toThrow('invalid chainType unknown')
        })
        test('bscbsc:v2', () => {
            expect(() => {
                processEndpointCriteria('bscbsc:v2')
            }).toThrow('invalid chainOrChainType bscbsc')
        })
        test('evm:v3', () => {
            expect(() => {
                processEndpointCriteria('evm:v3')
            }).toThrow('invalid endpoint version evm:v3')
        })
    })
})
