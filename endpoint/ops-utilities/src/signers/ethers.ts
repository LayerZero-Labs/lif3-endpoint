import { ethers } from 'ethers'

import { Transaction, TransactionGroup } from '@layerzerolabs/ops-core'
import { isTransaction, isTransactionGroup } from '@layerzerolabs/ops-plugin-core'

import { Signer } from './types'

export class EthersSigner implements Signer {
    protected provider: ethers.providers.Provider
    protected wallet: ethers.Wallet

    constructor(urlOrProvider: string | ethers.providers.Provider, privKey: string) {
        this.provider =
            typeof urlOrProvider === 'string'
                ? new ethers.providers.StaticJsonRpcProvider(urlOrProvider)
                : urlOrProvider
        this.wallet = new ethers.Wallet(privKey, this.provider)
    }

    public async signTransactions(txns: (Transaction | TransactionGroup)[]): Promise<Transaction[]> {
        const signer = this.wallet.connect(this.provider)

        // let gasPrice = (await signer.getGasPrice()) //.mul(12).div(10) // amplify gas price by 20%
        const pending = txns
            .map((txn) => {
                let retval: Transaction[] = []
                if (isTransaction(txn)) {
                    retval = [txn]
                } else if (isTransactionGroup(txn)) {
                    retval = txn.txns
                }
                return retval
            })
            .flat()

        const initial = await signer.getTransactionCount('pending')
        const signedTxns: Transaction[] = []

        let gasPrice = await signer.getGasPrice() // get gasPrice outside of the loop to reduce RPC calls
        // // shimmer specifically has a fixed gasPrice
        if (pending.length > 0) {
            if (!['shimmer-mainnet', 'shimmer-testnet'].includes(pending[0].network)) {
                gasPrice = gasPrice.mul(12).div(10) // amplify gas price by 20%
            }
        }

        // Before implementing a parallel request solution(we used Promise.all(pending.map) before), it's essential to be aware of any limitations on the number of requests imposed by certain RPCs.
        // Initially, it's advisable to send requests sequentially, one at a time, while exploring options for optimizing and parallelizing the process.
        for (let offset = 0; offset < pending.length; offset++) {
            const txn = pending[offset]

            const { network, env, signerName, raw } = txn

            let gasLimit: ethers.BigNumber
            if (txn.overrides?.gasLimit) {
                gasLimit = ethers.BigNumber.from(txn.overrides.gasLimit)
            } else {
                gasLimit = (await signer.estimateGas(txn.raw as any)).mul(12).div(10) // amplify gas limit by 20%
            }

            const nonce = initial + offset
            const tx = await signer.populateTransaction({
                ...(txn.raw as any),
                nonce,
                gasLimit,
                gasPrice,
            })
            const signed = await signer.signTransaction(tx)

            signedTxns.push({
                network,
                env,
                signerName,
                raw: txn,
                signed,
            } as Transaction)
        }
        return signedTxns
    }

    public getSigner(): unknown {
        return this.wallet
    }
}
