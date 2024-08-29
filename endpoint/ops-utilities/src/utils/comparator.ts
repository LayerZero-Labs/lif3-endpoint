import BN from 'bn.js'
import { BigNumber, BigNumberish, utils } from 'ethers'

// this is a copy of the function from ethers, and it supports BN from bn.js
export function isBigNumberish(value: unknown): value is BigNumberish {
    return (
        value != null &&
        (BigNumber.isBigNumber(value) ||
            (typeof value === 'number' && value % 1 === 0) ||
            (typeof value === 'string' && !!value.match(/^-?[0-9]+$/)) ||
            utils.isHexString(value) ||
            typeof value === 'bigint' ||
            utils.isBytes(value) ||
            BN.isBN(value))
    )
}

export function isEqualBigNumberish(
    value: unknown,
    other: unknown,
    _indexOrKey: string | number | symbol | undefined,
    _parent: unknown,
    _otherParent: unknown,
    _stack: unknown
): boolean | undefined {
    // NOTE: isBigNumberish consider 0x can be converted to a BigNumber, but BigNumber.from will throw exception.
    const fn = (x: unknown): unknown => {
        if (x === '0x' || x === '0X') {
            return '0x0'
        } else if (BN.isBN(x)) {
            return '0x' + x.toString('hex')
        } else {
            return x
        }
    }
    // NOTE: isBigNumberish consider an empty array is convertible, but BigNumber.from will throw exception.
    const isEmptyArray = (x: unknown): boolean => Array.isArray(x) && x.length === 0

    if (!isEmptyArray(value) && isBigNumberish(value) && !isEmptyArray(other) && isBigNumberish(other)) {
        const a = fn(value)
        const b = fn(other)
        const retval = BigNumber.from(a).eq(BigNumber.from(b))
        return retval
    }
    return undefined
}
