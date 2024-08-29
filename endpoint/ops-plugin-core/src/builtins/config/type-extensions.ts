import { EndpointId, Environment, Network, Stage } from '@layerzerolabs/lz-definitions'

declare module '@layerzerolabs/ops-core' {
    export interface OpsBundleUserConfig {
        config?: {
            configurator: Configurable | string
            options?: { [key: string]: any }
            requirements?: string[]
            skip?: boolean
            dependencies?: string[]
        }
    }

    export interface OpsBundleConfig {
        config?: {
            configurator: Configurable
            options: { [key: string]: any }
            requirements?: string[]
            skip: boolean
            dependencies: string[]
        }
    }

    export interface BlacklistConnectionConfigByStage {
        [key: string]: string[]
    }

    export type BlacklistConnectionConfig = {
        [key in Stage]?: BlacklistConnectionConfigByStage
    }

    export interface OpsUserConfig {
        blacklistConnections?: BlacklistConnectionConfig
    }

    export interface OpsConfig {
        blacklistConnections?: BlacklistConnectionConfig
    }
}

declare module '@layerzerolabs/ops-core' {
    export interface ConfigurableOption {
        stage: Stage
        env: Environment

        // extra options
        [key: string]: unknown
    }

    export interface Configurable {
        /**
         * Collect transactions
         * do not assume that the returned value is linked to the given parameters.
         * @param local
         * @param remotes
         * @param deployments
         * @param option
         * @returns (Transaction | TransactionGroup)[] a list of transactions
         */
        collectTransactions(
            local: EndpointId,
            remotes: EndpointId[],
            deployments: Deployment[],
            option: ConfigurableOption
        ): Promise<(Transaction | TransactionGroup)[]>

        signTransactions(transactions: (Transaction | TransactionGroup)[]): Promise<Transaction[]>

        sendTransactions(transactions: Transaction[], confirms?: number): Promise<string[]>

        preConfig?(
            local: EndpointId,
            remotes: EndpointId[],
            deployments: Deployment[],
            option: ConfigurableOption
        ): Promise<void>

        postConfig?(
            local: EndpointId,
            remotes: EndpointId[],
            deployments: Deployment[],
            option: ConfigurableOption
        ): Promise<void>
    }

    /**
     * TransactionBase contains the essential information to sign and submit transaction
     */
    export interface TransactionBase {
        type: string // example: 'Transaction' | 'TransactionGroup'
        /** The network that the transaction is going to be sent to */
        network: Network
        /** The environment of the network */
        env: Environment
        /** The signer's alias which will be used by SignerManager to find the matching private key */
        signerName: string
        /** The address of the signer */
        signer?: string
        /** The transaction will be signed and sent one by one */
        isIsolated?: boolean
        /** The transaction will be skipped to sign and send*/
        skipped?: boolean
    }

    /**
     * Transaction
     */
    export interface Transaction extends TransactionBase {
        type: 'Transaction'
        /** The raw transaction */
        raw: unknown
        /** The signed transaction */
        signed: unknown
        overrides?: {
            /** gasLimit */
            gasLimit?: string // for EVM
        }
        gnosisConfig?: unknown
    }

    /**
     * TransactionGroup
     * It represent a bunch of transactions that can be signed together, e.g, signed by Gnosis Safe
     */
    export interface TransactionGroup extends TransactionBase {
        type: 'TransactionGroup'
        /** A bunch of transactions */
        txns: Transaction[]
    }

    /**
     *  TransactionDisplay applies to the Transaction only
     */
    export interface DifferableTransaction {
        needChange: boolean
        localId?: EndpointId
        remoteId?: EndpointId | EndpointId[]
        diff?: { [key: string]: { newValue: any; oldValue: any } }

        // args: any[]
        // arguments?: string // readable stringifies args
        // difference?: string // readable stringifies diff
    }
}
