import { ethers } from 'ethers'

import { Chain, Stage, networkToChain } from '@layerzerolabs/lz-definitions'

// ------------------- treasury -------------------

// this it the immutable value set in the SendUln
// that caps the maximum gas limit which can be
// use by the treasury logic.
export const TREASURY_GAS_LIMIT = {
    [Stage.SANDBOX]: {
        default: 200000,
        [Chain.BSC]: 200000,
    },
    [Stage.TESTNET]: {
        default: 200000,
        [Chain.ARBITRUM]: 2500000,
    },
    [Stage.MAINNET]: {
        default: 200000,
        [Chain.ARBITRUM]: 2500000,
    },
}

// ------------------- priceFeed -------------------
export const PRICE_UPDATER = {
    [Stage.SANDBOX]: '0xB9Cb228D7498d6F02B0F88F7b16d2Cf836d2aeA9',
    [Stage.TESTNET]: '0xF5E8A439C599205C1aB06b535DE46681Aed1007a',
    [Stage.MAINNET]: '0x339d413CCEfD986b1B3647A9cfa9CBbE70A30749',
}

// ------------------- executor -------------------
export const EXECUTOR_ROLE_ADMIN = {
    [Stage.SANDBOX]: '',
    [Stage.TESTNET]: '0xc13b65f7c53Cd6db2EA205a4b574b4a0858720A6',
    [Stage.MAINNET]: '0x9F403140Bc0574D7d36eA472b82DAa1Bbd4eF327',
}

export const EXECUTOR_ADMINS = {
    [Stage.SANDBOX]: [
        '0xB9Cb228D7498d6F02B0F88F7b16d2Cf836d2aeA9',
        '0xF5E8A439C599205C1aB06b535DE46681Aed1007a',
        '0x0e251d9095dD128292A28eB383127d05d95BBD17',
        '0xc48CaB17Fcb3eb38030bc4EA54B62353d2802Ba8',
        '0x7AA071813c372a9b34A3bac1C002e2B7434C345E',
        '0xaAda98978453263132587D0805C4A17376Af9F13',
    ],
    [Stage.TESTNET]: [
        '0xB9Cb228D7498d6F02B0F88F7b16d2Cf836d2aeA9',
        '0xF5E8A439C599205C1aB06b535DE46681Aed1007a',
        '0x0e251d9095dD128292A28eB383127d05d95BBD17',
        '0xc48CaB17Fcb3eb38030bc4EA54B62353d2802Ba8',
    ],
    [Stage.MAINNET]: [
        '0xe93685f3bBA03016F02bD1828BaDD6195988D950', // relayer, signer new
        '0x339d413CCEfD986b1B3647A9cfa9CBbE70A30749',
    ],
}

export const NATIVE_DECIMALS_RATE: { [chain in Chain]?: string } = {
    [Chain.TRON]: ethers.utils.parseUnits('1', 6).toString(),
    [Chain.TRONDEV]: ethers.utils.parseUnits('1', 6).toString(),
    [Chain.HEDERA]: ethers.utils.parseUnits('1', 8).toString(),
}
export function getNativeDecimalsRate(networkName: string): string {
    return NATIVE_DECIMALS_RATE[networkToChain(networkName)] ?? ethers.utils.parseUnits('1', 18).toString()
}
