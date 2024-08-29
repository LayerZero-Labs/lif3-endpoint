import { ChainType } from '@layerzerolabs/lz-definitions'

import { OpsBundleConfig } from '../../../src'

const config: { bundles: Partial<OpsBundleConfig>[] } = {
    bundles: [
        {
            name: 'counter',
            path: 'evm',
            tags: ['v1', 'example', 'official'],
            chainTypes: [ChainType.EVM],
        },
        {
            name: 'counter',
            path: 'aptos',
            tags: ['v1'],
            chainTypes: [ChainType.APTOS],
        },
        {
            name: 'counter',
            path: 'evm',
            tags: ['v1'],
        },
    ],
}
export default config
