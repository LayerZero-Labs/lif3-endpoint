import _ from 'lodash'

import {
    Chain,
    ChainType,
    Environment,
    Network,
    Stage,
    getChainType,
    isTronChain,
    networkToChain,
    networkToChainType,
    networkToStage,
} from '@layerzerolabs/lz-definitions'
import { getKeypairFromMnemonic } from '@layerzerolabs/lz-utilities'

import { ProviderManager } from '../providers'

import { AptosSigner } from './aptos'
import { EthersSigner } from './ethers'
import { GnosisSigner } from './gnosis'
import { SolanaSigner } from './solana'
import { SquadsSigner } from './squads'
import { TronSigner } from './tron'
import {
    CombinedGnosisItemConfig,
    CombinedSquadsItemConfig,
    Signer,
    SignerConfig,
    SignerItemConfig,
    SignerManager,
} from './types'
import { isGnosisItemConfig, isSquadsItemConfig } from './utils'

const cache: { [key: string]: Signer } = {}

export class LayerZeroSignerManager implements SignerManager {
    constructor(
        private signerConfig: SignerConfig,
        private providerManager: ProviderManager
    ) {}

    protected getItemConfig(
        stage: Stage,
        chain: Chain,
        keyName: string
    ): SignerItemConfig | CombinedGnosisItemConfig | CombinedSquadsItemConfig {
        let retval: SignerItemConfig | CombinedGnosisItemConfig | CombinedSquadsItemConfig | undefined
        retval = this.signerConfig[stage]?.[chain]?.[keyName]
        // try chainType if chain not config
        if (retval === undefined) {
            const chainType = getChainType(chain)
            retval = this.signerConfig[stage]?.[chainType]?.[keyName]
        }
        if (retval === undefined) {
            throw new Error(`Not found keys setting of ${keyName} for ${chain}-${stage}`)
        }

        // fetch NativeSignerItemConfig from chainType if not config
        if (
            (isGnosisItemConfig(retval) || isSquadsItemConfig(retval)) &&
            retval.pk === undefined &&
            retval.mnemonic === undefined
        ) {
            const chainType = getChainType(chain)
            const nativeSignerConfig = this.signerConfig[stage]?.[chainType]?.[keyName]
            retval = _.assign(retval, _.pick(nativeSignerConfig, ['mnemonic', 'path', 'address', 'pk']))
        }

        return retval
    }

    public async getSigner(network: Network, env: Environment, keyName: string): Promise<Signer> {
        const stage = networkToStage(network)
        const chain = networkToChain(network)
        const chainType = networkToChainType(network)
        const cacheKey = `${network}-${env}-${keyName}`
        if (cache[cacheKey] !== undefined) {
            return cache[cacheKey]
        }
        const itemConfig = this.getItemConfig(stage, chain, keyName)

        let privKey: string
        if (itemConfig.pk !== undefined) {
            privKey = itemConfig.pk
        } else {
            if (itemConfig.mnemonic === undefined) {
                throw new Error(`Mnemonic for chain ${chain}  keyName ${keyName} is undefined`)
            }
            const account = getKeypairFromMnemonic(chainType, itemConfig.mnemonic, itemConfig.path)
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            privKey = account.privateKey!
        }

        const provider = await this.providerManager.getProvider(chain, env)
        switch (chainType) {
            case ChainType.EVM: {
                const url = provider.getUrl()
                let signer: Signer
                if (isTronChain(chain)) {
                    signer = new TronSigner(provider.rpcSetting, privKey)
                } else {
                    signer = isGnosisItemConfig(itemConfig)
                        ? new GnosisSigner(url, privKey, itemConfig)
                        : new EthersSigner(url, privKey)
                }
                cache[cacheKey] = signer
                return signer
            }
            case ChainType.SOLANA: {
                const url = provider.getUrl()
                if (itemConfig.mnemonic === undefined) {
                    throw new Error(`Mnemonic for ${chain} is undefined`)
                }
                const signer = isSquadsItemConfig(itemConfig)
                    ? await SquadsSigner.from(url, itemConfig.mnemonic, itemConfig.path, itemConfig)
                    : await SolanaSigner.from(url, itemConfig.mnemonic, itemConfig.path)

                cache[cacheKey] = signer
                return signer
            }
            case ChainType.APTOS: {
                const url = provider.getUrl()
                const signer = new AptosSigner(url, privKey)
                cache[cacheKey] = signer
                return signer
            }
            default:
                throw new Error(`Not implemented Signer for ${chainType}`)
        }
    }
}
