import * as aptos from 'aptos'

import { EndpointId, Environment, Network } from '@layerzerolabs/lz-definitions'
import { Deployment } from '@layerzerolabs/ops-core'

import { ConfigureManager } from '../config'
import { ProviderManager } from '../providers'
import { SignerManager } from '../signers'

import { BaseConfigurable } from './base'
import { AptosTransactionData } from './utils'

export abstract class LayerZeroAptosBaseConfigurable extends BaseConfigurable {
    constructor(configManager: ConfigureManager, providerManager: ProviderManager, signerManager: SignerManager) {
        super(configManager, providerManager, signerManager)
    }

    abstract buildTransactionDatas(
        local: EndpointId,
        remotes: EndpointId[],
        deployments: Deployment[],
        network: Network,
        env: Environment,
        provider: aptos.AptosClient,
        moduleSdk: any
    ): Promise<AptosTransactionData[]>
}
