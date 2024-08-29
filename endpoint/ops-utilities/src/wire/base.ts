import { EndpointId } from '@layerzerolabs/lz-definitions'
import {
    Configurable,
    ConfigurableOption,
    Deployment,
    Transaction,
    TransactionGroup,
    getLogger,
} from '@layerzerolabs/ops-core'

import { ConfigureManager } from '../config'
import { ProviderManager } from '../providers'
import { SignerManager } from '../signers'

import { sendTransactionsHelper, signTransactionsHelper } from './utils'

export abstract class BaseConfigurable implements Configurable {
    protected logger: ReturnType<typeof getLogger> = getLogger()

    protected constructor(
        protected configManager: ConfigureManager,
        protected providerManager: ProviderManager,
        protected signerManager: SignerManager
    ) {}

    public abstract collectTransactions(
        local: EndpointId,
        remotes: EndpointId[],
        deployments: Deployment[],
        option: ConfigurableOption
    ): Promise<(Transaction | TransactionGroup)[]>

    public async signTransactions(transactions: (Transaction | TransactionGroup)[]): Promise<Transaction[]> {
        return signTransactionsHelper(transactions, this.signerManager)
    }

    public async sendTransactions(transactions: Transaction[], confirms?: number): Promise<string[]> {
        const signerFn = async (transactions: (Transaction | TransactionGroup)[]): Promise<Transaction[]> => {
            return signTransactionsHelper(transactions, this.signerManager)
        }
        return sendTransactionsHelper(transactions, this.providerManager, signerFn, confirms)
    }
}
