import { Chain, EndpointId, EndpointVersion } from '@layerzerolabs/lz-definitions'

import { ChainOrDefault, DVNConfigType, EidOrDefault, PriceModelType } from './common'

interface DVNAdapterBaseConfig {
    admins: { [chain in ChainOrDefault]?: { [address: string]: boolean } }
    msgLibPaths: {
        [chain in ChainOrDefault]?: {
            [sendLib: string]: {
                [receiveLib in
                    | 'receive301' // default
                    | 'receive302' // default
                    | `${EndpointId}-receive301` // per endpoint
                    | `${EndpointId}-receive302`]?: string // per endpoint
            }
        }
    }
    defaultMultiplierBps: { [chain in ChainOrDefault]?: number }
    feeLib: { [chain in ChainOrDefault]?: string }
}

export interface ConfigTypeV2<Eid extends number> {
    registerLibrary: { [eid in Eid]: string[] }
    defaultSendLibrary: { [eid in Eid]: { [dstEid: string]: string } }
    defaultReceiveLibrary: { [eid in Eid]: { [srcEid: string]: string } }
    simpleMessageLib?: {
        oracle: { [eid in EidOrDefault<Eid>]?: string }
        defaultOption: { [eid in EidOrDefault<Eid>]?: string }
    }
    uln302Send?: {
        // outbound
        defaultOutboundMaxMessageSize: {
            [eid in EidOrDefault<Eid>]?: { [dstEid: string]: string | number } // by endpointId
        }
        inboundBlockConf: { [chain in Chain | 'default']?: { [remoteChain: string]: string | number } }
        defaultOutboundExecutor: { [eid in EidOrDefault<Eid>]?: { [dstEid: string]: string } }
        // verifier
        defaultUlnVerifiers: { [eid in EidOrDefault<Eid>]?: { [srcEid: string]: string[] } }
        defaultUlnOptionalVerifiers: { [eid in EidOrDefault<Eid>]?: { [srcEid: string]: string[] } }
        defaultUlnOptionalVerifierThreshold: {
            [eid in EidOrDefault<Eid>]?: { [srcEid: string]: number | string }
        }
        // treasury
        treasury: { [eid in EidOrDefault<Eid>]?: string }
        solana?: {
            treasury?: {
                admin: string
                nativeReceiver: string
                nativeFeeBps: number
                lzTokenReceiver: string
                lzTokenFee: number
            }
        }
    }
    uln302Receive?: {
        // inbound
        defaultInboundConfirmations: {
            [eid in EidOrDefault<Eid>]?: { [dstEid: string]: string | number }
        }
        // verifier
        defaultUlnVerifiers: { [eid in EidOrDefault<Eid>]?: { [srcEid: string]: string[] } }
        defaultUlnOptionalVerifiers: { [eid in EidOrDefault<Eid>]?: { [srcEid: string]: string[] } }
        defaultUlnOptionalVerifierThreshold: {
            [eid in EidOrDefault<Eid>]?: { [srcEid: string]: number | string }
        }
    }
    verifier?: {
        [type: string]: DVNConfigType<Eid>
    }
    dvnAdapters?: {
        axelar?: {
            multiplierBps: { [chain in ChainOrDefault]?: { [remoteChain: string]: number } }
            peer: { [chain in ChainOrDefault]?: { [remoteChain: string]: string } } // the address of the verifier peer on the other chain
        } & DVNAdapterBaseConfig
        ccip?: {
            multiplierBps: { [chain in ChainOrDefault]?: { [remoteChain: string]: number } }
            // https://docs.chain.link/ccip/best-practices/#setting-gaslimit
            gasLimit: { [chain in ChainOrDefault]?: { [remoteChain: string]: string } }
            peer: { [chain in ChainOrDefault]?: { [remoteChain: string]: string } }
        } & DVNAdapterBaseConfig
        // optimism?: {
        //     gasLimit: { [chain in EidChainOrDefault<Eid>]?: number }
        //     peer: { [chain in EidChainOrDefault<Eid>]?: { [remote: string]: string } }
        // } & DVNAdapterBaseConfig
    }
    executor?: {
        executorFeeLib: { [eid in EidOrDefault<Eid>]?: string }
        defaultMultiplierBps: { [eid in EidOrDefault<Eid>]?: number }
        admins: { [eid in EidOrDefault<Eid>]?: { [address: string]: boolean } }
        superAdmins?: { [eid in EidOrDefault<Eid>]?: { [address: string]: boolean } }
        solana?: {
            executors: { [eid in EidOrDefault<Eid>]?: { [address: string]: boolean } }
        }

        messageLibs: { [eid in EidOrDefault<Eid>]?: { [address: string]: boolean } }
        // config with remote eid
        nativeDropCap: { [chain in ChainOrDefault]?: { [remoteChain: string]: string } }
        lzReceiveBaseGas: {
            [eid in EidOrDefault<Eid>]?: { [version in EndpointVersion]: { [remoteChain: string]: string } }
        }
        lzComposeBaseGas: {
            [eid in EidOrDefault<Eid>]?: { [version in EndpointVersion]: { [remoteChain: string]: string } }
        }
        dstMultiplierBps: { [chain in ChainOrDefault]?: { [remoteChain: string]: number } }
        floorMarginUSD: { [chain in ChainOrDefault]?: { [remoteChain: string]: string } }
        owner?: { [eid in Eid]?: string }
    }
    priceFeed?: {
        updater: { [eid in EidOrDefault<Eid>]?: { [address: string]: boolean } }
        priceRatioDenominator: { [eid in EidOrDefault<Eid>]?: string }
        arbitrumCompressionPercent: { [eid in EidOrDefault<Eid>]?: string }
        nativeTokenPriceUSD: { [eid in EidOrDefault<Eid>]?: string }
        // config with remote eid
        defaultModelPrice: {
            [eid in EidOrDefault<EndpointId>]?: {
                // priceFeed is used by EndpointV1 & EndpointV2
                [remoteEid: string]: {
                    priceRatio: string
                    gasPriceInUnit: string
                    gasPerByte: string
                    // arbitrum only
                    gasPerL2Tx?: string
                    gasPerL1CallDataByte?: string
                    // solana to op stack only
                    l1Eid?: number
                }
            }
        }
        modelType: {
            [chain in Chain]?: PriceModelType
        }
        admin?: { [eid in Eid]?: string }
    }
    gasLimitMultiplier: { [chain in ChainOrDefault]?: number }
    endpoint?: { admin?: { [eid in Eid]?: string } }
    uln?: { admin?: { [eid in Eid]?: string } }
}
