import { Chain, Environment } from '@layerzerolabs/lz-definitions'
import '@layerzerolabs/ops-plugin-core'
import { Configurable } from '@layerzerolabs/ops-core'

import { ProviderSetting } from './manager'

export interface Provider extends Pick<Configurable, 'sendTransactions'> {
    getProvider(): unknown
    getUrl(): string
    get rpcSetting(): ProviderSetting
}

export interface ProviderManager {
    getProvider(chain: Chain, env: Environment): Promise<Provider>
}
