import { ethers } from 'ethers'

import { EndpointId, Environment, Network } from '@layerzerolabs/lz-definitions'
import { ConfigurableOption, Deployment, Transaction, TransactionGroup } from '@layerzerolabs/ops-core'

import { ConfigureManager } from '../config'
import { ProviderManager } from '../providers'
import { SignerManager } from '../signers'

import { BaseConfigurable } from './base'
import { TransactionData, collectTransactionsEvmHelper } from './utils'

export abstract class LayerZeroEvmBaseConfigurable extends BaseConfigurable {
    protected contracts: [string, string][] = []

    protected constructor(
        configManager: ConfigureManager,
        providerManager: ProviderManager,
        signerManager: SignerManager
    ) {
        super(configManager, providerManager, signerManager)
    }

    public async collectTransactions(
        local: EndpointId,
        remotes: EndpointId[],
        deployments: Deployment[],
        option: ConfigurableOption
    ): Promise<(Transaction | TransactionGroup)[]> {
        const callback = this.buildTransactionDatas.bind(this)
        return collectTransactionsEvmHelper(
            local,
            remotes,
            deployments,
            option,
            this.configManager,
            this.providerManager,
            this.signerManager,
            this.contracts,
            callback
        )
    }

    public abstract buildTransactionDatas(
        local: EndpointId,
        remotes: EndpointId[],
        deployments: Deployment[],
        network: Network,
        env: Environment,
        provider: ethers.providers.Provider,
        contract: ethers.Contract,
        packageName: string,
        contractName: string
    ): Promise<TransactionData[]>
}
