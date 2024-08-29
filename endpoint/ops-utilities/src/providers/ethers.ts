import SafeApiKit from '@safe-global/api-kit'
import Safe, { ContractNetworksConfig, EthersAdapter } from '@safe-global/protocol-kit'
import { ethers } from 'ethers'

import { Transaction } from '@layerzerolabs/ops-core'

import { GnosisItemConfig, GnosisSigned } from '../signers'

import { ProviderSetting } from './manager'
import { Provider } from './types'

export class EthersProvider implements Provider {
    constructor(public rpcSetting: ProviderSetting) {}

    getUrl(): string {
        return typeof this.rpcSetting === 'string' ? this.rpcSetting : this.rpcSetting.url
    }

    getProvider(): ethers.providers.JsonRpcProvider {
        return new ethers.providers.StaticJsonRpcProvider(this.getUrl())
    }

    public async sendTransactions(transactions: Transaction[], confirms?: number): Promise<string[]> {
        const transactionHashes: string[] = []
        for (const txn of transactions) {
            if (txn.gnosisConfig) {
                transactionHashes.push(await this.sendGnosisTxns(txn))
            } else {
                transactionHashes.push(await this.sendNativeTxns(txn, confirms))
            }
        }
        return transactionHashes
    }

    public async sendNativeTxns(txn: Transaction, confirms?: number): Promise<string> {
        const provider = this.getProvider()
        const response = await provider.sendTransaction(txn.signed as string)
        if (confirms && confirms > 0) {
            await response.wait(confirms)
        }
        return response.hash
    }

    public async sendGnosisTxns(txn: Transaction): Promise<string> {
        const { signed, signer } = txn
        if (signer === undefined) {
            throw new Error('signer is undefined')
        }
        const { safeUrl, safeAddress, contractNetworks } = txn.gnosisConfig as GnosisItemConfig

        const dummySigner = ethers.Wallet.createRandom().connect(this.getProvider())

        const ethAdapter = new EthersAdapter({
            ethers,
            signerOrProvider: dummySigner,
        })
        const safeService = new SafeApiKit({ txServiceUrl: safeUrl, ethAdapter })

        const safeSdk: Safe = await Safe.create({
            ethAdapter,
            safeAddress,
            contractNetworks: contractNetworks as ContractNetworksConfig,
        })

        const { safeTransaction, signedTxHash } = signed as GnosisSigned

        const safeTxHash = await safeSdk.getTransactionHash(safeTransaction)
        await safeService.proposeTransaction({
            safeAddress,
            safeTransactionData: safeTransaction.data,
            safeTxHash,
            senderAddress: signer,
            senderSignature: signedTxHash.data,
        })
        return safeTxHash
    }
}
