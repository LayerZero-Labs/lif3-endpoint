import { Chain, ChainType, Environment, getChainType, isTronChain } from '@layerzerolabs/lz-definitions'

import { AptosProvider, EthersProvider, Provider, ProviderManager } from '../providers'

import { SolanaProvider } from './solana'
import { TronProvider } from './tron'

export type ProviderSetting =
    | {
          url: string
          apiKey?: string
      }
    | string

export type ProviderConfig = {
    [env in Environment]?: {
        [chain in Chain]?: ProviderSetting
    }
}

export class LayerZeroProviderManager implements ProviderManager {
    public readonly providers: { [name: string]: Provider } = {}

    constructor(public readonly config: ProviderConfig) {}

    protected createProvider(chain: Chain, _env: Environment, setting: ProviderSetting): Provider {
        if (getChainType(chain) === ChainType.EVM) {
            if (isTronChain(chain)) {
                return new TronProvider(setting)
            }
            return new EthersProvider(setting)
        } else if (chain === Chain.APTOS) {
            return new AptosProvider(setting)
        } else if (chain == Chain.SOLANA) {
            return SolanaProvider.from(setting)
        } else {
            throw new Error(`Not implemented`)
        }
    }

    public async getProvider(chain: Chain, env: Environment): Promise<Provider> {
        const key = `${chain}-${env}`

        if (this.providers[key] === undefined) {
            const setting = this.config[env]?.[chain]
            if (setting === undefined) {
                throw new Error(`No provider(rpc) configuration found for ${chain}-${env} `)
            }

            this.providers[key] = this.createProvider(chain, env, setting)
        }

        const retval = this.providers[key]
        return Promise.resolve(retval)
    }
}
