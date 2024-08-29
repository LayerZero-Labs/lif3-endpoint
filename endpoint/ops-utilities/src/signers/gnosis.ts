import SafeApiKit from '@safe-global/api-kit'
import Safe, { ContractNetworksConfig, EthersAdapter, SafeTransactionOptionalProps } from '@safe-global/protocol-kit'
import { ethers } from 'ethers'

import { Transaction, TransactionGroup } from '@layerzerolabs/ops-core'
import { isTransaction, isTransactionGroup } from '@layerzerolabs/ops-plugin-core'

import { GnosisItemConfig, GnosisSigned, Signer } from './types'

export class GnosisSigner implements Signer {
    protected provider: ethers.providers.Provider
    protected wallet: ethers.Wallet
    protected safeConfig: GnosisItemConfig

    public constructor(
        urlOrProvider: string | ethers.providers.Provider,
        privKey: string,
        safeConfig: GnosisItemConfig
    ) {
        this.provider =
            typeof urlOrProvider === 'string'
                ? new ethers.providers.StaticJsonRpcProvider(urlOrProvider)
                : urlOrProvider
        this.wallet = new ethers.Wallet(privKey)
        this.safeConfig = safeConfig
    }

    public async signTransactions(txns: (Transaction | TransactionGroup)[]): Promise<Transaction[]> {
        const signer = this.wallet.connect(this.provider)
        const ethAdapter = new EthersAdapter({
            ethers,
            signerOrProvider: signer,
        })

        const safeService = new SafeApiKit({ txServiceUrl: this.safeConfig.safeUrl, ethAdapter })

        const { safeAddress, contractNetworks } = this.safeConfig

        const safeSdk: Safe = await Safe.create({
            ethAdapter,
            safeAddress,
            contractNetworks: contractNetworks as ContractNetworksConfig,
        })

        const promises = txns.map(async (txn): Promise<Transaction | undefined> => {
            const nonce = await safeService.getNextNonce(safeAddress)
            let pending: Transaction[] = []
            if (isTransaction(txn)) {
                pending = [txn]
            } else if (isTransactionGroup(txn)) {
                pending = txn.txns
            }

            if (pending.length === 0) {
                return undefined
            }

            const { network, env, signerName } = pending[0]

            const raw = pending.map((x) => {
                return { ...(x.raw as any), value: '0' } // You need to set the value, otherwise will throw an error when signTransaction.
            })

            const options: SafeTransactionOptionalProps = { nonce }
            const safeTransaction = await safeSdk.createTransaction({ safeTransactionData: raw, options })
            const safeTxHash = await safeSdk.getTransactionHash(safeTransaction)
            const signedTxHash = await safeSdk.signTransactionHash(safeTxHash)

            const signed: GnosisSigned = {
                safeTransaction: safeTransaction,
                signedTxHash: signedTxHash,
            }

            return {
                type: 'Transaction',
                network,
                env,
                signerName,
                raw: txn,
                signed,
                signer: signer.address,
                gnosisConfig: this.safeConfig,
            }
        })

        const retval = await Promise.all(promises)
        return retval.filter((x): x is Transaction => x !== undefined)
    }

    public getSigner(): unknown {
        throw new Error('Method not implemented.')
    }
}
