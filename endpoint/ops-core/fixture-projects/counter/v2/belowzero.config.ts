import { Chain, ChainType } from '@layerzerolabs/lz-definitions'

import { OpsBundleConfig } from '../../../src'

const config: { bundles: Partial<OpsBundleConfig>[] } = {
    bundles: [
        {
            name: 'counter',
            path: 'evm',
            tags: ['v2', 'example', 'official'],
            chainTypes: [ChainType.EVM],
        },
        {
            name: 'counter',
            path: 'solana',
            tags: ['v2'],
            chainTypes: [ChainType.SOLANA],
        },
        {
            name: 'counter',
            path: 'evm',
            tags: ['v2'],
            chains: [Chain.ZKSYNC],
            chainTypes: [ChainType.EVM],
        },
    ],
}
export default config
