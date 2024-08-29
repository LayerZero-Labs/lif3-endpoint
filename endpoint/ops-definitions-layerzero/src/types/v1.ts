import { Chain, EndpointId } from '@layerzerolabs/lz-definitions'

import { ChainOrDefault, DVNConfigType } from './common'

export interface ConfigType<EndpointId extends number> {
    inboundBlockConf: { [chain in Chain | 'default']?: { [remoteChain: string | 'default']: string | number } }
    evm: {
        relayerBaseGas: { [chain in ChainOrDefault]?: { [proof in ProofType]?: number } }
        relayerApprovedAddresses: { [address: string]: boolean }
        relayerPriceMultiplierBps: { [endpointId in string]: number }
        relayerPriceConfigUpdaterAddresses: { [address: string]: boolean }
        relayerPriceMultipliers: { [chain in ChainOrDefault]?: { [remoteChain: string]: number } }
        relayerFloorMargins: { [chain in ChainOrDefault]?: { [remoteChain: string]: string } }
        priceFeedUpdaterAddresses: { [address: string]: boolean }
        messageLibrary: { [endpointId: string]: string[] }
        supportedOutboundProof: { [endpointId in EndpointId]: { [remoteId: string]: ProofType[] } }
        inboundProofLibrary: { [endpointId in EndpointId]: { [remoteId: string]: [ProofType, string][] } }
        outboundProofType: { [endpointId in EndpointId]: { [remoteId: string]: ProofType } }
    }
    aptos?: {
        relayerBaseGas: { [chain in ChainOrDefault]?: number }
        relayerFeePerByte: { [chain in ChainOrDefault]?: number }
        executorAirdropAmtCap: { [remoteChain: string]: string }
        executorPriceRatio: { [chain: string]: number }
        executorGasPrice: { [chain: string]: number }
    }
    defaultSendVersion: { [endpointId: string]: string }
    defaultSendVersionByPath: { [endpointId: string]: { [remoteId: string]: string } }
    defaultReceiveVersion: { [endpointId: string]: string }
    defaultReceiveVersionByPath: { [endpointId: string]: { [remoteId: string]: string } }
    defaultExecutor: { [endpointId in EndpointId]?: { [remoteId: string]: [number, string] } }
    defaultAdapterParams: {
        [endpointId in EndpointId]: { [remoteId: string]: { [proof in ProofType]?: [number, number] } }
    }
    airdropCap: { [chain in ChainOrDefault]?: { [remoteChain: string]: string } }
    addressSize: { [chain: string]: number }
    gasPerByte: { [chain: string]: number }
    oracle: {
        validators: { [endpointId in string]: { [address: string]: boolean } }
        threshold: { [endpointId in string]: number }
        evm: {
            type: { [endpointId in EndpointId]: { [remoteId: string]: [string, string] } }
            admins: { [address: string]: boolean }
            feeConfigUpdaters: { [address: string]: boolean }
            multiplierBps: { [endpointId in string]: number }
            dstGas: { [chain in ChainOrDefault]?: { [proof in ProofType]?: number } }
            oraclePriceMultipliers: { [chain in ChainOrDefault]?: { [remoteChain: string]: number } }
            oracleFloorMargins: { [chain in ChainOrDefault]?: { [remoteChain: string]: string } }
        }
        aptos: {
            multisigValidators: { [endpointId in string]: { [address: string]: boolean } }
            admins: { [endpointId in string]: { [address: string]: boolean } }
            baseGas?: { [remoteChain: string]: number }
        }
    }
    uln301Send: {
        // outbound
        defaultOutboundMaxMessageSize: {
            [eid in EndpointId | 'default']?: { [dstEid: string | 'default']: string | number }
        }
        inboundBlockConf: { [chain in Chain | 'default']?: { [remoteChain: string | 'default']: string | number } }
        defaultOutboundExecutor: { [eid in EndpointId | 'default']?: { [dstEid: string | 'default']: string } }
        // verifier
        defaultUlnVerifiers: { [eid in EndpointId | 'default']?: { [srcEid: string | 'default']: string[] } }
        defaultUlnOptionalVerifiers: { [eid in EndpointId | 'default']?: { [srcEid: string | 'default']: string[] } }
        defaultUlnOptionalVerifierThreshold: {
            [eid in EndpointId | 'default']?: { [srcEid: string | 'default']: number | string }
        }
        // treasury
        treasury: { [eid in EndpointId | 'default']?: string }
        // address size
        addressSize: { [chain in ChainOrDefault]?: number }
    }
    uln301Receive: {
        // inbound
        defaultInboundConfirmations: {
            [eid in EndpointId | 'default']?: { [srcEid: string | 'default']: string | number }
        }
        defaultInboundExecutor: { [eid in EndpointId | 'default']?: { [srcEid: string | 'default']: string } }
        // verifier
        defaultUlnVerifiers: { [eid in EndpointId | 'default']?: { [srcEid: string | 'default']: string[] } }
        defaultUlnOptionalVerifiers: { [eid in EndpointId | 'default']?: { [srcEid: string | 'default']: string[] } }
        defaultUlnOptionalVerifierThreshold: {
            [eid in EndpointId | 'default']?: { [srcEid: string | 'default']: number | string }
        }
        // address size
        addressSize: { [chain in ChainOrDefault]?: number }
    }
    altToken?: { [eid in EndpointId]?: string }
    verifier?: {
        [type: string]: DVNConfigType<EndpointId>
    }
    gasLimitMultiplier: { [chain in ChainOrDefault]?: number }
}

export const ADDRESS_SIZE: ConfigType<EndpointId>['addressSize'] = {
    default: 20,
    [Chain.APTOS]: 32,
}

export const GAS_PER_BYTE: ConfigType<EndpointId>['gasPerByte'] = {
    default: 16,
    [Chain.APTOS]: 1,
}

export enum ProofType {
    MPT = 1,
    FP = 2,
}
