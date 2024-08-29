import { describe, test } from '@jest/globals'
import { BigNumber } from 'ethers'

import { PrettierBigNumber } from './kits'

describe('JSON.stringify', () => {
    test.each([
        [BigNumber.from('65535'), '65535'],
        [BigNumber.from('1234567890'), '"0x499602d2"'],
        [BigNumber.from(10 ** 10), '"0x02540be400"'],
        [{ gas: BigNumber.from('0x015f90') }, '{"gas":"0x015f90"}'],
    ])('BigNumberToBigInt', (value, expected) => {
        expect(JSON.stringify(value, PrettierBigNumber)).toEqual(expected)
    })
})
