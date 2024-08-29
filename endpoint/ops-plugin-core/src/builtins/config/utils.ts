import './type-extensions'

import * as commander from 'commander'

import { EndpointId } from '@layerzerolabs/lz-definitions'
import {
    Configurable,
    ConfigurableOption,
    Deployment,
    DifferableTransaction,
    OpsConfig,
    OpsEnvironment,
    OpsUserConfig,
    Transaction,
    TransactionGroup,
    getBundleIdent,
} from '@layerzerolabs/ops-core'

import root from './command'
import { toDisplaySendTxn } from './kits'

export function processConfig(userConfig: Readonly<OpsUserConfig>, config: OpsConfig): void {
    for (const bundleConfig of userConfig.bundles ?? []) {
        if (bundleConfig.config === undefined) {
            continue
        }

        const configurator = ((value): string | Configurable =>
            typeof value === 'string' ? new CommandConfigurable(value) : value)(bundleConfig.config.configurator)
        if (!isConfigurable(configurator)) {
            throw new Error(`the configurator of ${bundleConfig.name} is not configurable`)
        }

        const ident = getBundleIdent(bundleConfig)
        const target = config.bundles.find((p) => p.ident === ident)
        if (target === undefined) {
            continue
        }

        ;(bundleConfig.config.requirements ?? []).forEach((x) => {
            if (config.bundles.find((p) => p.alias === x) === undefined) {
                throw new Error(`Not found project with alias ${x}`)
            }
        })

        target.config = {
            configurator: configurator,
            requirements: bundleConfig.config.requirements,
            options: bundleConfig.config.options ?? {},
            skip: bundleConfig.config.skip ?? false,
            dependencies: bundleConfig.config.dependencies ?? [],
        }
    }
    config.blacklistConnections = userConfig.blacklistConnections
}

export class CommandConfigurable implements Configurable {
    constructor(private readonly command: string) {}

    async signTransactions(_transactions: (Transaction | TransactionGroup)[]): Promise<Transaction[]> {
        return Promise.resolve([])
    }
    async sendTransactions(_transactions: Transaction[]): Promise<string[]> {
        return Promise.resolve([])
    }

    async collectTransactions(
        _local: EndpointId,
        _remotes: EndpointId[],
        _deployments: Deployment[],
        _option?: ConfigurableOption
    ): Promise<Transaction[]> {
        return Promise.resolve([])
    }
}

export function buildCommandFamily(env: OpsEnvironment): commander.Command[] {
    root.setOptionValue('__CONTEXT__', env)
    // @ts-expect-error TS2322 Command type doesn't matter here
    return [root]
}

export function isConfigurable(obj: unknown): obj is Configurable {
    if (obj === undefined || obj === null || typeof obj !== 'object') {
        return false
    }

    return (
        'collectTransactions' in obj &&
        typeof obj.collectTransactions === 'function' &&
        'sendTransactions' in obj &&
        typeof obj.sendTransactions === 'function'
    )
}

export function isDifferableTransaction(obj: unknown): obj is DifferableTransaction {
    if (obj === undefined || obj === null || typeof obj !== 'object') {
        return false
    }

    return 'needChange' in obj && typeof obj.needChange === 'boolean'
}

export function isTransaction(obj: unknown): obj is Transaction {
    if (obj === undefined || obj === null || typeof obj !== 'object') {
        return false
    }

    return 'type' in obj && obj.type === 'Transaction'
}

export function isTransactionGroup(obj: unknown): obj is TransactionGroup {
    if (obj === undefined || obj === null || typeof obj !== 'object') {
        return false
    }

    return 'type' in obj && obj.type === 'TransactionGroup'
}

let prev = 0

export function printSendProgress(
    signedTx: Transaction,
    startIndexes: { [network: string]: number },
    totalTxns: { [network: string]: number },
    printResult: { [network: string]: { request: string; current: string } }
): void {
    const req = signedTx.raw as Transaction | TransactionGroup
    const transactions = isTransactionGroup(req) ? req.txns : [req]
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < transactions.length; i++) {
        const txn = transactions[i]
        const txnResult = toDisplaySendTxn(txn)
        const network = txn.network as string
        startIndexes[network] = startIndexes[network] ? ++startIndexes[network] : 1
        printResult[network] = {
            request: `${startIndexes[network]}/${totalTxns[network]}`,
            current: `${txnResult['contract/module'] as string}.${txnResult['method/function'] as string}`,
        }
        if (prev && typeof process.stdout.moveCursor === 'function') {
            process.stdout.moveCursor(0, -prev)
            process.stdout.clearScreenDown()
        }
        prev = Object.keys(printResult).length + 4
        console.table(Object.keys(printResult).map((network) => ({ network, ...printResult[network] })))
    }
}

export function isTransactionOrTransactionGroupNeedChange(req: Transaction | TransactionGroup): boolean {
    if (isTransaction(req)) {
        return isDifferableTransaction(req) && req.needChange && req.skipped !== true
    } else if (isTransactionGroup(req)) {
        return req.txns.some((x) => isDifferableTransaction(x) && x.needChange && x.skipped !== true)
    }
    return false
}

export function removeTransactionGroupNoNeedChangeTxns(
    req: Transaction | TransactionGroup
): Transaction | TransactionGroup {
    if (isTransactionGroup(req)) {
        req.txns = req.txns.filter((x) => isDifferableTransaction(x) && x.needChange && x.skipped !== true)
        return req
    } else {
        return req
    }
}

export function groupTransactionsBySignerAndIsolate(
    transactions: (Transaction | TransactionGroup)[]
): (Transaction | TransactionGroup)[] {
    const groups: TransactionGroup[] = []
    let currentGroup: TransactionGroup | undefined
    for (const txn of transactions) {
        if (!currentGroup || txn.signerName !== currentGroup.signerName || txn.isIsolated === true) {
            currentGroup = isTransactionGroup(txn)
                ? txn
                : ((): TransactionGroup => ({
                      type: 'TransactionGroup',
                      network: txn.network,
                      env: txn.env,
                      signerName: txn.signerName,
                      isIsolated: txn.isIsolated,
                      txns: [txn],
                  }))()

            groups.push(currentGroup)
            if (txn.isIsolated === true) {
                currentGroup = undefined
            }
        } else {
            currentGroup.txns.push(...(isTransactionGroup(txn) ? txn.txns : [txn]))
        }
    }

    return groups
}
