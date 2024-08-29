import { describe, expect } from '@jest/globals'
import BN from 'bn.js'
import _ from 'lodash'

import { isEqualBigNumberish } from './comparator'
describe('comparator', () => {
    // 9007199254740991 is Number.MAX_SAFE_INTEGER, and BigNumber.from(9007199254740991) will throw exception
    it.each([
        // [a, b, expected]
        [0, '0x', true],
        [9007199254740990, 9007199254740990, true],
        ['9007199254740990', '9007199254740990', true],
        [9007199254740990, '9007199254740990', true],
        [9007199254740990, 9007199254740990n, true],
        [123456789, new BN('123456789'), true],
        [9007199254740991n, new BN('9007199254740991'), true],
    ])('%s === %s should be %s', (a, b, expected) => {
        expect(_.isEqualWith(a, b, isEqualBigNumberish)).toBe(expected)
    })
})
