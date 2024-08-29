import { ChainType } from '@layerzerolabs/lz-definitions'

export default {
    bundles: [
        {
            name: 'counter',
            path: 'evm',
            tags: ['v2'],
            chainType: ChainType.EVM,
            deploy: {
                deployer: 'command',
                options: {},
            },
            config: {
                configurator: 'command',
                options: {},
            },
        },
        {
            name: 'counter',
            path: 'solana',
            tags: ['v2'],
            chainType: ChainType.SOLANA,
            deploy: {
                deployer: 'command',
                options: {},
            },
            config: {
                configurator: 'command',
                options: {},
            },
        },
    ],
}
