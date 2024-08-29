import { ChainType } from '@layerzerolabs/lz-definitions'

import { Configurator } from './aptos/ops/configurator'
import { Deployer } from './aptos/ops/deployer'

export default {
    bundles: [
        {
            name: 'counter',
            path: 'evm',
            tags: ['v1'],
            chainType: ChainType.EVM,
            deploy: {
                deployer: 'command',
                options: {},
            },
            config: {
                configurator: new Configurator(),
                options: {},
            },
        },
        {
            name: 'counter',
            path: 'aptos',
            tags: ['v1'],
            chainType: ChainType.APTOS,
            deploy: {
                deployer: new Deployer(),
                options: {},
            },
            config: {
                configurator: new Configurator(),
                options: {},
            },
        },
    ],
}
