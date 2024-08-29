import * as aptos from 'aptos'
import invariant from 'tiny-invariant'

import { Transaction, TransactionGroup } from '@layerzerolabs/ops-core'
import { isTransaction, isTransactionGroup } from '@layerzerolabs/ops-plugin-core'

import { Signer } from './types'

export const GAS_LIMIT_SAFETY_BPS = 2000

export class AptosSigner implements Signer {
    protected provider: aptos.AptosClient
    protected wallet: aptos.AptosAccount

    constructor(url: string, privKey: string) {
        this.provider = new aptos.AptosClient(url)
        const privateKeyBytes = aptos.HexString.ensure(privKey).toUint8Array()
        this.wallet = new aptos.AptosAccount(privateKeyBytes)
    }

    async signTransactions(txns: (Transaction | TransactionGroup)[]): Promise<Transaction[]> {
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
        const initialAccountData = await this.provider.getAccount(this.wallet.address())
        const initial = initialAccountData.sequence_number
        const promises = pending.map(async (txn, offset) => {
            const { network, env, signerName, raw } = txn

            const payload = raw as aptos.Types.EntryFunctionPayload
            let gasOptions: {
                max_gas_amount: string
                gas_unit_price: string
            }
            if (txn.overrides?.gasLimit) {
                const gasPrice = await this.estimateGasPrice()
                gasOptions = {
                    max_gas_amount: txn.overrides.gasLimit,
                    gas_unit_price: gasPrice.toString(),
                }
            } else {
                gasOptions = await this.estimateGas(this.wallet, payload)
            }

            const options = {
                sequence_number: (BigInt(initial) + BigInt(offset)).toString(),
                ...gasOptions,
            }
            const txnRequest = await this.provider.generateTransaction(this.wallet.address(), payload, options)
            const signed = await this.provider.signTransaction(this.wallet, txnRequest)

            return {
                network,
                env,
                signerName,
                raw: txn,
                signed,
            } as Transaction
        })

        return await Promise.all(promises)
    }

    getSigner(): unknown {
        return this.wallet
    }

    async estimateGas(
        signer: aptos.AptosAccount,
        payload: aptos.Types.EntryFunctionPayload
    ): Promise<{
        max_gas_amount: string
        gas_unit_price: string
    }> {
        const txnRequest = await this.provider.generateTransaction(signer.address(), payload)
        const sim = await this.provider.simulateTransaction(signer, txnRequest, {
            estimateGasUnitPrice: true,
            estimateMaxGasAmount: true,
            estimatePrioritizedGasUnitPrice: true,
        })
        const tx = sim[0]
        invariant(tx.success, `EstimateGas Transaction failed: ${tx.vm_status}}`)
        const max_gas_amount = this.applyGasLimitSafety(tx.gas_used).toString()
        return {
            max_gas_amount,
            gas_unit_price: tx.gas_unit_price,
        }
    }
    async estimateGasPrice(): Promise<number> {
        return (await this.provider.estimateGasPrice()).gas_estimate
    }

    applyGasLimitSafety(gasUsed: string): bigint {
        return (BigInt(gasUsed) * BigInt(10000 + GAS_LIMIT_SAFETY_BPS)) / BigInt(10000)
    }
}
