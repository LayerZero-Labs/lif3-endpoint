import * as fs from 'fs'
import * as path from 'path'

import { BigNumber } from 'ethers'
import _ from 'lodash'
import * as papaparse from 'papaparse'

import { Chain, EndpointVersion, Stage, chainAndStageToEndpointId } from '@layerzerolabs/lz-definitions'
import { BlacklistConnectionConfigByStage, Transaction } from '@layerzerolabs/ops-core'

function isBigNumberConvertible(value: any): boolean {
    return !!(
        value &&
        typeof value === 'object' &&
        (value._isBigNumber || ('type' in value && 'hex' in value && value.type === 'BigNumber'))
    )
}

export function PrettierBigNumber(_key: any, value: any): any {
    if (isBigNumberConvertible(value)) {
        const val = BigNumber.from(value)
        if (val.toBigInt() <= BigInt(65535)) {
            return val.toNumber()
        } else {
            return val.toHexString()
        }
    }
    if (typeof value === 'bigint') {
        return value.toString()
    }

    return value
}

/**
 * format the transaction to be suitable for display
 * @param txn transaction or undefined
 * @returns return columns if txn is undefined, otherwise return formatted object
 */
export function toDisplay(txn: Transaction | undefined): string[] | { [key in string]: any } {
    const columns = [
        'needChange',
        'skipped',
        'multisig',
        'localId',
        'remoteId',
        'signerName',
        'packageName',
        'contract/module',
        'method/function',
        'args',
        'diff',
        'raw',
    ]

    if (txn === undefined) {
        return columns
    }

    return _display(columns, txn)
}

export function toDisplaySendTxn(txn: Transaction): { [key in string]: any } {
    return _display(['contract/module', 'method/function'], txn)
}

function _display(columns: string[], txn: Transaction): { [key in string]: any } {
    return {
        network: txn.network,
        ...columns.reduce((accu: { [key in string]: any }, column) => {
            const keys = column.split('/')

            accu[column] = ((): any => {
                const obj = txn as any
                const values = _.map(keys, (field) => {
                    if (typeof obj[field] === 'object') {
                        return JSON.stringify(obj[field], PrettierBigNumber)
                    } else {
                        return obj[field]
                    }
                })
                const foundValue = _.find(values, (value) => value !== undefined)
                return foundValue
            })()
            return accu
        }, {}),
    }
}

export function writeToCsv(filename: string, txns: Transaction[]): void {
    const data = txns.map((txn) => toDisplay(txn) as { [key in string]: any })

    const dirname = path.dirname(filename)
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true })
    }

    const csv = papaparse.unparse({
        fields: ['network', ...(toDisplay(undefined) as string[])],
        data: data,
    })
    fs.writeFileSync(filename, csv)

    console.log(`Full configuration written to: ${path.resolve(filename)}`)
}

export function verifyBlackConnectionSymmetrical(blacklistConnections: BlacklistConnectionConfigByStage): void {
    for (const from in blacklistConnections) {
        for (const to of blacklistConnections[from]) {
            // check that to is in blacklistConnections
            if (!Object.keys(blacklistConnections).includes(to)) {
                throw new Error(`blacklistConnections ${from} -> ${to} is not symmetrical`)
            }

            if (!blacklistConnections[to].includes(from)) {
                throw new Error(`blacklistConnections ${from} -> ${to} is not symmetrical`)
            }
        }
    }
}

export function isSupportChainAndStageAndVersion(chain: Chain, stage: Stage, version: EndpointVersion): boolean {
    try {
        chainAndStageToEndpointId(chain, stage, version)
        return true
    } catch (e) {
        return false
    }
}

// export function showTable(txns: Transaction[], showCalldata: boolean) {
//     const evmColumns = ['packageName', 'contract', 'method']
//     const aptosColumns = ['module', 'function']
//     const solanaColumns = ['signers', 'contract', 'method']

//     const types = new Set(txns.map((x) => x.walletType))
//     txns.forEach((tx) => {
//         tx.arguments = tx.args.map((x) => (typeof x === 'object' ? JSON.stringify(x) : x)).join(', ')
//         tx.difference = JSON.stringify(tx.diff)
//     })

//     let consoleColumns = ['multisig', 'endpointId', 'remoteId', 'walletType', 'walletName']
//     if (types.has('evm')) {
//         consoleColumns = consoleColumns.concat(evmColumns)
//         // show calldata at the end
//         if (showCalldata) {
//             consoleColumns.push('populatedTxn')
//         }
//     }
//     if (types.has('aptos')) {
//         consoleColumns = consoleColumns.concat(aptosColumns)
//         // show calldata at the end
//         if (showCalldata) {
//             consoleColumns.push('payload')
//         }
//     }
//     if (types.has('solana')) {
//         consoleColumns = consoleColumns.concat(solanaColumns)

//         // convert signers to string
//         txns.forEach((tx) => {
//             // @ts-ignore
//             if (tx['signers'] && tx['signers'].length > 0) {
//                 // @ts-ignore
//                 tx['signers'] = tx['signers'].map((signer) => signer.publicKey.toString())
//             }
//         })

//         // show calldata at the end
//         if (showCalldata) {
//             consoleColumns.push('payload')
//         }
//     }
//     consoleColumns = consoleColumns.concat(['arguments', 'difference'])

//     console.table(txns, Array.from(new Set(consoleColumns)))
// }
