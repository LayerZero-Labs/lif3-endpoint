import { Chain, EndpointVersion } from '@layerzerolabs/lz-definitions'

export type WithDefault<T> = T | 'default'
export type EidOrDefault<Eid extends number> = WithDefault<Eid>
export type ChainOrDefault = WithDefault<Chain>
export type EidChainOrDefault<Eid extends number> = EidOrDefault<Eid> | Chain

export interface DVNConfigType<Eid extends number> {
    dvnFeeLib: { [eid in EidOrDefault<Eid>]?: string }
    defaultMultiplierBps: { [eid in EidOrDefault<Eid>]?: number }
    admins: { [eid in EidOrDefault<Eid>]?: { [address: string]: boolean } }
    // config with remote eid
    dstGas: { [eid in EidOrDefault<Eid>]?: { [version in EndpointVersion]: { [remoteChain: string]: string } } }
    dstMultiplierBps: { [chain in ChainOrDefault]?: { [remoteChain: string]: number } }
    floorMarginUSD: { [chain in ChainOrDefault]?: { [remoteChain: string]: string } }
    signers?: { [eid in EidOrDefault<Eid>]?: string[] }
    quorum?: { [eid in EidOrDefault<Eid>]?: number }
    messageLibs?: { [eid in EidOrDefault<Eid>]?: { [address: string]: boolean } }
}

export enum PriceModelType {
    DEFAULT,
    ARB_STACK,
    OP_STACK,
}
