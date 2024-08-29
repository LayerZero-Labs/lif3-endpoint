import { ContractNetworkConfig } from '@safe-global/protocol-kit/dist/src/types'
import { SafeSignature, SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { Keypair } from '@solana/web3.js'
import { TransactionAccount } from '@sqds/sdk'

import { Chain, ChainType, Environment, Network, Stage } from '@layerzerolabs/lz-definitions'
import { Configurable } from '@layerzerolabs/ops-core'

export interface Signer extends Pick<Configurable, 'signTransactions'> {
    getSigner(): unknown
}

export interface SignerManager {
    getSigner(network: Network, env: Environment, keyName: string): Promise<Signer>
}

export interface GnosisSigned {
    safeTransaction: SafeTransaction
    signedTxHash: SafeSignature
}

export interface SquadsSigned {
    multisigTransaction: TransactionAccount
    keypair: Keypair
}

// ------------------ Account/Signer Config ------------------

export interface SignerItemConfig {
    mnemonic?: string
    path?: string
    address?: string
    pk?: string
}

export interface GnosisItemConfig {
    safeUrl: string
    safeAddress: string
    contractNetworks?: {
        [id: string]: Partial<ContractNetworkConfig>
    }
}

export interface SquadsItemConfig {
    multisigAddress: string
}

export type GnosisConfigByStage = {
    [chainOrType in ChainType | Chain]?: { [keyName: string]: GnosisItemConfig | SquadsItemConfig }
}

// config by stage, chain, keyName
export type GnosisConfig = {
    [stage in Stage]?: GnosisConfigByStage
}

export type CombinedGnosisItemConfig = GnosisItemConfig & SignerItemConfig
export type CombinedSquadsItemConfig = SquadsItemConfig & SignerItemConfig

/**
 * config by stage, chain, keyName
 * example:
 * ```json
 * {
 *  "sandbox": {
 *    "ethereum": {
 *      "key1": {
 *        "mnemonic": "xxx",
 *         "path": "xxx"
 *       },
 *      "key2": {
 *        "pk": "xxx",
 *        "path": "xxx"
 *         safeUrl: "xxx",
 *         safeAddress: "xxx"
 *      }
 *    }
 *  }
 * }
 * ```
 */
export type SignerConfig = {
    [stage in Stage]?: {
        [chainOrType in ChainType | Chain]?: {
            [keyName: string]: SignerItemConfig | CombinedGnosisItemConfig | CombinedSquadsItemConfig
        }
    }
}
