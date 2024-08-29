import '../../../../../../ops-plugin-core/src/builtins'
import { EndpointId, endpointIdToNetwork } from '@layerzerolabs/lz-definitions'
import { Configurable, ConfigurableOption, Deployment, Transaction, TransactionGroup } from '@layerzerolabs/ops-core'

export class Configurator implements Configurable {
    async collectTransactions(
        local: EndpointId,
        remotes: EndpointId[],
        deployments: Deployment[],
        option: ConfigurableOption
    ): Promise<(Transaction | TransactionGroup)[]> {
        const fakeTransaction = {
            network: endpointIdToNetwork(local, option.env),
            env: option.env,
            type: 'Transaction',
            signerName: 'fakeSigner',
            raw: {
                type: 'Transaction',
            },
            signed: undefined,
            needChange: true,
            // print
            localId: local,
            remoteId: remotes,
            packageName: 'fakePackageName',
            contract: 'fakeContractName',
            method: 'fakeMethodName',
            args: ['fakeArg1', 'fakeArg2'],
            diff: { oldValue: 'fakeOldValue', newValue: 'fakeNewValue' },
        }
        const r = [fakeTransaction as Transaction]
        console.log('Configurator.collectTransactions', r)
        return r
    }

    async sendTransactions(transactions: Transaction[], confirms?: number): Promise<string[]> {
        console.log('Configurator.sendTransactions', transactions)
        return []
    }

    async signTransactions(transactions: (Transaction | TransactionGroup)[]): Promise<Transaction[]> {
        console.log('Configurator.signTransactions', transactions)
        const txns: Transaction[] = []
        for (const txn of transactions) {
            if (txn.type === 'Transaction') {
                txn.signed = 'fakeSigned'
                txns.push(txn)
            } else {
                for (const t of txn.txns) {
                    t.signed = 'fakeSigned'
                    txns.push(t)
                }
            }
        }
        return txns
    }
}
