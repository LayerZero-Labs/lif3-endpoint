import { Stage } from '@layerzerolabs/lz-definitions'

import { LayerZeroConfigManager } from './manager'

describe('LayerZeroConfigManager test', () => {
    it('get', () => {
        const configManager = new LayerZeroConfigManager({
            [Stage.SANDBOX]: {
                a: {
                    a_sub: 1,
                },
            },
            [Stage.TESTNET]: {},
            [Stage.MAINNET]: {},
        })

        const configValue = configManager.get(Stage.SANDBOX, 'a', 'a_sub')
        expect(configValue).toEqual(1)
    })
})
