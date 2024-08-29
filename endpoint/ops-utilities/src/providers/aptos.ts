import * as aptos from 'aptos'
import invariant from 'tiny-invariant'

import { Transaction } from '@layerzerolabs/ops-core'

import { ProviderSetting } from './manager'
import { Provider } from './types'

export class AptosProvider implements Provider {
    constructor(public rpcSetting: ProviderSetting) {}

    getUrl(): string {
        return typeof this.rpcSetting === 'string' ? this.rpcSetting : this.rpcSetting.url
    }

    getProvider(): aptos.AptosClient {
        return new aptos.AptosClient(this.getUrl())
    }

    async sendTransactions(transactions: Transaction[], _confirms?: number): Promise<string[]> {
        const transactionHashes: string[] = []
        const provider = this.getProvider()
        for (const txn of transactions) {
            const tx = await this.sendAndConfirmRawTransaction(provider, txn.signed as Uint8Array)
            transactionHashes.push(tx.hash)
        }
        return transactionHashes
    }

    private async waitAndGetTransaction(
        provider: aptos.AptosClient,
        txnHash: string
    ): Promise<aptos.Types.Transaction> {
        await provider.waitForTransaction(txnHash)

        const tx: aptos.Types.Transaction = await provider.getTransactionByHash(txnHash)
        invariant(tx.type == 'user_transaction', `Invalid response type: ${tx.type}`)
        const txn = tx as aptos.Types.Transaction_UserTransaction
        invariant(txn.success, `Transaction failed: ${txn.vm_status}`)
        return tx
    }

    private async sendAndConfirmRawTransaction(
        provider: aptos.AptosClient,
        signedTransaction: Uint8Array
    ): Promise<aptos.Types.Transaction> {
        const res = await provider.submitTransaction(signedTransaction)
        return this.waitAndGetTransaction(provider, res.hash)
    }
}
