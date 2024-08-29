import { Chain, EndpointVersion, EndpointId } from '@layerzerolabs/lz-definitions';

type WithDefault<T> = T | 'default';
type EidOrDefault<Eid extends number> = WithDefault<Eid>;
type ChainOrDefault = WithDefault<Chain>;
type EidChainOrDefault<Eid extends number> = EidOrDefault<Eid> | Chain;
interface DVNConfigType<Eid extends number> {
    dvnFeeLib: {
        [eid in EidOrDefault<Eid>]?: string;
    };
    defaultMultiplierBps: {
        [eid in EidOrDefault<Eid>]?: number;
    };
    admins: {
        [eid in EidOrDefault<Eid>]?: {
            [address: string]: boolean;
        };
    };
    dstGas: {
        [eid in EidOrDefault<Eid>]?: {
            [version in EndpointVersion]: {
                [remoteChain: string]: string;
            };
        };
    };
    dstMultiplierBps: {
        [chain in ChainOrDefault]?: {
            [remoteChain: string]: number;
        };
    };
    floorMarginUSD: {
        [chain in ChainOrDefault]?: {
            [remoteChain: string]: string;
        };
    };
    signers?: {
        [eid in EidOrDefault<Eid>]?: string[];
    };
    quorum?: {
        [eid in EidOrDefault<Eid>]?: number;
    };
    messageLibs?: {
        [eid in EidOrDefault<Eid>]?: {
            [address: string]: boolean;
        };
    };
}
declare enum PriceModelType {
    DEFAULT = 0,
    ARB_STACK = 1,
    OP_STACK = 2
}

interface ConfigType<EndpointId extends number> {
    inboundBlockConf: {
        [chain in Chain | 'default']?: {
            [remoteChain: string | 'default']: string | number;
        };
    };
    evm: {
        relayerBaseGas: {
            [chain in ChainOrDefault]?: {
                [proof in ProofType]?: number;
            };
        };
        relayerApprovedAddresses: {
            [address: string]: boolean;
        };
        relayerPriceMultiplierBps: {
            [endpointId in string]: number;
        };
        relayerPriceConfigUpdaterAddresses: {
            [address: string]: boolean;
        };
        relayerPriceMultipliers: {
            [chain in ChainOrDefault]?: {
                [remoteChain: string]: number;
            };
        };
        relayerFloorMargins: {
            [chain in ChainOrDefault]?: {
                [remoteChain: string]: string;
            };
        };
        priceFeedUpdaterAddresses: {
            [address: string]: boolean;
        };
        messageLibrary: {
            [endpointId: string]: string[];
        };
        supportedOutboundProof: {
            [endpointId in EndpointId]: {
                [remoteId: string]: ProofType[];
            };
        };
        inboundProofLibrary: {
            [endpointId in EndpointId]: {
                [remoteId: string]: [ProofType, string][];
            };
        };
        outboundProofType: {
            [endpointId in EndpointId]: {
                [remoteId: string]: ProofType;
            };
        };
    };
    aptos?: {
        relayerBaseGas: {
            [chain in ChainOrDefault]?: number;
        };
        relayerFeePerByte: {
            [chain in ChainOrDefault]?: number;
        };
        executorAirdropAmtCap: {
            [remoteChain: string]: string;
        };
        executorPriceRatio: {
            [chain: string]: number;
        };
        executorGasPrice: {
            [chain: string]: number;
        };
    };
    defaultSendVersion: {
        [endpointId: string]: string;
    };
    defaultSendVersionByPath: {
        [endpointId: string]: {
            [remoteId: string]: string;
        };
    };
    defaultReceiveVersion: {
        [endpointId: string]: string;
    };
    defaultReceiveVersionByPath: {
        [endpointId: string]: {
            [remoteId: string]: string;
        };
    };
    defaultExecutor: {
        [endpointId in EndpointId]?: {
            [remoteId: string]: [number, string];
        };
    };
    defaultAdapterParams: {
        [endpointId in EndpointId]: {
            [remoteId: string]: {
                [proof in ProofType]?: [number, number];
            };
        };
    };
    airdropCap: {
        [chain in ChainOrDefault]?: {
            [remoteChain: string]: string;
        };
    };
    addressSize: {
        [chain: string]: number;
    };
    gasPerByte: {
        [chain: string]: number;
    };
    oracle: {
        validators: {
            [endpointId in string]: {
                [address: string]: boolean;
            };
        };
        threshold: {
            [endpointId in string]: number;
        };
        evm: {
            type: {
                [endpointId in EndpointId]: {
                    [remoteId: string]: [string, string];
                };
            };
            admins: {
                [address: string]: boolean;
            };
            feeConfigUpdaters: {
                [address: string]: boolean;
            };
            multiplierBps: {
                [endpointId in string]: number;
            };
            dstGas: {
                [chain in ChainOrDefault]?: {
                    [proof in ProofType]?: number;
                };
            };
            oraclePriceMultipliers: {
                [chain in ChainOrDefault]?: {
                    [remoteChain: string]: number;
                };
            };
            oracleFloorMargins: {
                [chain in ChainOrDefault]?: {
                    [remoteChain: string]: string;
                };
            };
        };
        aptos: {
            multisigValidators: {
                [endpointId in string]: {
                    [address: string]: boolean;
                };
            };
            admins: {
                [endpointId in string]: {
                    [address: string]: boolean;
                };
            };
            baseGas?: {
                [remoteChain: string]: number;
            };
        };
    };
    uln301Send: {
        defaultOutboundMaxMessageSize: {
            [eid in EndpointId | 'default']?: {
                [dstEid: string | 'default']: string | number;
            };
        };
        inboundBlockConf: {
            [chain in Chain | 'default']?: {
                [remoteChain: string | 'default']: string | number;
            };
        };
        defaultOutboundExecutor: {
            [eid in EndpointId | 'default']?: {
                [dstEid: string | 'default']: string;
            };
        };
        defaultUlnVerifiers: {
            [eid in EndpointId | 'default']?: {
                [srcEid: string | 'default']: string[];
            };
        };
        defaultUlnOptionalVerifiers: {
            [eid in EndpointId | 'default']?: {
                [srcEid: string | 'default']: string[];
            };
        };
        defaultUlnOptionalVerifierThreshold: {
            [eid in EndpointId | 'default']?: {
                [srcEid: string | 'default']: number | string;
            };
        };
        treasury: {
            [eid in EndpointId | 'default']?: string;
        };
        addressSize: {
            [chain in ChainOrDefault]?: number;
        };
    };
    uln301Receive: {
        defaultInboundConfirmations: {
            [eid in EndpointId | 'default']?: {
                [srcEid: string | 'default']: string | number;
            };
        };
        defaultInboundExecutor: {
            [eid in EndpointId | 'default']?: {
                [srcEid: string | 'default']: string;
            };
        };
        defaultUlnVerifiers: {
            [eid in EndpointId | 'default']?: {
                [srcEid: string | 'default']: string[];
            };
        };
        defaultUlnOptionalVerifiers: {
            [eid in EndpointId | 'default']?: {
                [srcEid: string | 'default']: string[];
            };
        };
        defaultUlnOptionalVerifierThreshold: {
            [eid in EndpointId | 'default']?: {
                [srcEid: string | 'default']: number | string;
            };
        };
        addressSize: {
            [chain in ChainOrDefault]?: number;
        };
    };
    altToken?: {
        [eid in EndpointId]?: string;
    };
    verifier?: {
        [type: string]: DVNConfigType<EndpointId>;
    };
    gasLimitMultiplier: {
        [chain in ChainOrDefault]?: number;
    };
}
declare const ADDRESS_SIZE: ConfigType<EndpointId>['addressSize'];
declare const GAS_PER_BYTE: ConfigType<EndpointId>['gasPerByte'];
declare enum ProofType {
    MPT = 1,
    FP = 2
}

interface DVNAdapterBaseConfig {
    admins: {
        [chain in ChainOrDefault]?: {
            [address: string]: boolean;
        };
    };
    msgLibPaths: {
        [chain in ChainOrDefault]?: {
            [sendLib: string]: {
                [receiveLib in 'receive301' | 'receive302' | `${EndpointId}-receive301` | `${EndpointId}-receive302`]?: string;
            };
        };
    };
    defaultMultiplierBps: {
        [chain in ChainOrDefault]?: number;
    };
    feeLib: {
        [chain in ChainOrDefault]?: string;
    };
}
interface ConfigTypeV2<Eid extends number> {
    registerLibrary: {
        [eid in Eid]: string[];
    };
    defaultSendLibrary: {
        [eid in Eid]: {
            [dstEid: string]: string;
        };
    };
    defaultReceiveLibrary: {
        [eid in Eid]: {
            [srcEid: string]: string;
        };
    };
    simpleMessageLib?: {
        oracle: {
            [eid in EidOrDefault<Eid>]?: string;
        };
        defaultOption: {
            [eid in EidOrDefault<Eid>]?: string;
        };
    };
    uln302Send?: {
        defaultOutboundMaxMessageSize: {
            [eid in EidOrDefault<Eid>]?: {
                [dstEid: string]: string | number;
            };
        };
        inboundBlockConf: {
            [chain in Chain | 'default']?: {
                [remoteChain: string]: string | number;
            };
        };
        defaultOutboundExecutor: {
            [eid in EidOrDefault<Eid>]?: {
                [dstEid: string]: string;
            };
        };
        defaultUlnVerifiers: {
            [eid in EidOrDefault<Eid>]?: {
                [srcEid: string]: string[];
            };
        };
        defaultUlnOptionalVerifiers: {
            [eid in EidOrDefault<Eid>]?: {
                [srcEid: string]: string[];
            };
        };
        defaultUlnOptionalVerifierThreshold: {
            [eid in EidOrDefault<Eid>]?: {
                [srcEid: string]: number | string;
            };
        };
        treasury: {
            [eid in EidOrDefault<Eid>]?: string;
        };
        solana?: {
            treasury?: {
                admin: string;
                nativeReceiver: string;
                nativeFeeBps: number;
                lzTokenReceiver: string;
                lzTokenFee: number;
            };
        };
    };
    uln302Receive?: {
        defaultInboundConfirmations: {
            [eid in EidOrDefault<Eid>]?: {
                [dstEid: string]: string | number;
            };
        };
        defaultUlnVerifiers: {
            [eid in EidOrDefault<Eid>]?: {
                [srcEid: string]: string[];
            };
        };
        defaultUlnOptionalVerifiers: {
            [eid in EidOrDefault<Eid>]?: {
                [srcEid: string]: string[];
            };
        };
        defaultUlnOptionalVerifierThreshold: {
            [eid in EidOrDefault<Eid>]?: {
                [srcEid: string]: number | string;
            };
        };
    };
    verifier?: {
        [type: string]: DVNConfigType<Eid>;
    };
    dvnAdapters?: {
        axelar?: {
            multiplierBps: {
                [chain in ChainOrDefault]?: {
                    [remoteChain: string]: number;
                };
            };
            peer: {
                [chain in ChainOrDefault]?: {
                    [remoteChain: string]: string;
                };
            };
        } & DVNAdapterBaseConfig;
        ccip?: {
            multiplierBps: {
                [chain in ChainOrDefault]?: {
                    [remoteChain: string]: number;
                };
            };
            gasLimit: {
                [chain in ChainOrDefault]?: {
                    [remoteChain: string]: string;
                };
            };
            peer: {
                [chain in ChainOrDefault]?: {
                    [remoteChain: string]: string;
                };
            };
        } & DVNAdapterBaseConfig;
    };
    executor?: {
        executorFeeLib: {
            [eid in EidOrDefault<Eid>]?: string;
        };
        defaultMultiplierBps: {
            [eid in EidOrDefault<Eid>]?: number;
        };
        admins: {
            [eid in EidOrDefault<Eid>]?: {
                [address: string]: boolean;
            };
        };
        superAdmins?: {
            [eid in EidOrDefault<Eid>]?: {
                [address: string]: boolean;
            };
        };
        solana?: {
            executors: {
                [eid in EidOrDefault<Eid>]?: {
                    [address: string]: boolean;
                };
            };
        };
        messageLibs: {
            [eid in EidOrDefault<Eid>]?: {
                [address: string]: boolean;
            };
        };
        nativeDropCap: {
            [chain in ChainOrDefault]?: {
                [remoteChain: string]: string;
            };
        };
        lzReceiveBaseGas: {
            [eid in EidOrDefault<Eid>]?: {
                [version in EndpointVersion]: {
                    [remoteChain: string]: string;
                };
            };
        };
        lzComposeBaseGas: {
            [eid in EidOrDefault<Eid>]?: {
                [version in EndpointVersion]: {
                    [remoteChain: string]: string;
                };
            };
        };
        dstMultiplierBps: {
            [chain in ChainOrDefault]?: {
                [remoteChain: string]: number;
            };
        };
        floorMarginUSD: {
            [chain in ChainOrDefault]?: {
                [remoteChain: string]: string;
            };
        };
        owner?: {
            [eid in Eid]?: string;
        };
    };
    priceFeed?: {
        updater: {
            [eid in EidOrDefault<Eid>]?: {
                [address: string]: boolean;
            };
        };
        priceRatioDenominator: {
            [eid in EidOrDefault<Eid>]?: string;
        };
        arbitrumCompressionPercent: {
            [eid in EidOrDefault<Eid>]?: string;
        };
        nativeTokenPriceUSD: {
            [eid in EidOrDefault<Eid>]?: string;
        };
        defaultModelPrice: {
            [eid in EidOrDefault<EndpointId>]?: {
                [remoteEid: string]: {
                    priceRatio: string;
                    gasPriceInUnit: string;
                    gasPerByte: string;
                    gasPerL2Tx?: string;
                    gasPerL1CallDataByte?: string;
                    l1Eid?: number;
                };
            };
        };
        modelType: {
            [chain in Chain]?: PriceModelType;
        };
        admin?: {
            [eid in Eid]?: string;
        };
    };
    gasLimitMultiplier: {
        [chain in ChainOrDefault]?: number;
    };
    endpoint?: {
        admin?: {
            [eid in Eid]?: string;
        };
    };
    uln?: {
        admin?: {
            [eid in Eid]?: string;
        };
    };
}

declare const PRICE_FEED_USD_DECIMALS = 20;
declare const ALT_TOKEN_CHAINS: Chain[];

declare const EVM_ULNV2_ADDRESS = "@layerzerolabs/lz-evm-sdk-v1|UltraLightNodeV2";
declare const EVM_ULNV2_ALT_TOKEN_ADDRESS = "@layerzerolabs/lz-evm-sdk-v1|UltraLightNodeV2AltToken";
declare const EVM_SEND_ULN302_ADDRESS = "@layerzerolabs/lz-evm-sdk-v2|SendUln302";
declare const EVM_RECEIVE_ULN302_ADDRESS = "@layerzerolabs/lz-evm-sdk-v2|ReceiveUln302";
declare const SOLANA_ULN302_ADDRESS = "@layerzerolabs/lz-solana-sdk-v2|uln";
declare const SOLANA_BLOCKED_MESSAGE_ADDRESS = "@layerzerolabs/lz-solana-sdk-v2|blocked_messagelib";
declare const SOLANA_DVN_ADDRESS = "@layerzerolabs/lz-solana-sdk-v2|dvn";
declare const SOLANA_EXECUTOR_ADDRESS = "@layerzerolabs/lz-solana-sdk-v2|executor";
declare const EVM_SEND_ULN301_ADDRESS = "@layerzerolabs/lz-evm-sdk-v2|SendUln301";
declare const EVM_RECEIVE_ULN301_ADDRESS = "@layerzerolabs/lz-evm-sdk-v2|ReceiveUln301";
declare const EVM_SIMPLE_MESSAGE_LIB_ADDRESS = "@layerzerolabs/lz-evm-sdk-v2|SimpleMessageLib";
declare const SOLANA_SIMPLE_MESSAGE_LIB_ADDRESS = "@layerzerolabs/lz-solana-sdk-v2|simple_messagelib";
declare const EVM_EXECUTOR_ADDRESS = "@layerzerolabs/lz-evm-sdk-v2|Executor";
declare const EVM_EXECUTOR_FEE_LIB_ADDRESS = "@layerzerolabs/lz-evm-sdk-v2|ExecutorFeeLib";
declare const EVM_VERIFIER_FEE_LIB_ADDRESS = "@layerzerolabs/lz-evm-sdk-v2|DVNFeeLib";
declare const EVM_VERIFIER_ADDRESS = "@layerzerolabs/lz-evm-sdk-v2|DVN";
declare const EVM_DVN_GDCA_ADDRESS = "@layerzerolabs/lz-evm-sdk-v2|DVNGCDA";
declare const EVM_DVN_LZ_ADDRESS = "@layerzerolabs/lz-evm-sdk-v2|DVNLZ";
declare const EVM_DEAD_DVN = "@layerzerolabs/lz-evm-sdk-v2|DeadDVN";
declare const EVM_TREASURY_ADDRESS = "@layerzerolabs/lz-evm-sdk-v2|Treasury";
declare const EVM_AxelarDVNAdapter_ADDRESS = "@layerzerolabs/lz-evm-sdk-v2|AxelarDVNAdapter";
declare const EVM_AxelarDVNAdapterFeeLib_ADDRESS = "@layerzerolabs/lz-evm-sdk-v2|AxelarDVNAdapterFeeLib";
declare const EVM_CCIPDVNAdapter_ADDRESS = "@layerzerolabs/lz-evm-sdk-v2|CCIPDVNAdapter";
declare const EVM_CCIPDVNAdapterFeeLib_ADDRESS = "@layerzerolabs/lz-evm-sdk-v2|CCIPDVNAdapterFeeLib";
declare const EVM_OptimismDVNAdapterL1_ADDRESS = "@layerzerolabs/lz-evm-sdk-v2|OptimismDVNAdapterL1";
declare const EVM_OptimismDVNAdapterL2_ADDRESS = "@layerzerolabs/lz-evm-sdk-v2|OptimismDVNAdapterL2";
declare const EVM_EXECUTOR_DECOMPRESSOR_ADDRESS = "@layerzerolabs/lz-evm-sdk-v2|ExecutorDecompressor";
declare const EVM_DVN_DECOMPRESSOR_ADDRESS = "@layerzerolabs/lz-evm-sdk-v2|DVNDecompressor";

export { ADDRESS_SIZE, ALT_TOKEN_CHAINS, type ChainOrDefault, type ConfigType, type ConfigTypeV2, type DVNConfigType, EVM_AxelarDVNAdapterFeeLib_ADDRESS, EVM_AxelarDVNAdapter_ADDRESS, EVM_CCIPDVNAdapterFeeLib_ADDRESS, EVM_CCIPDVNAdapter_ADDRESS, EVM_DEAD_DVN, EVM_DVN_DECOMPRESSOR_ADDRESS, EVM_DVN_GDCA_ADDRESS, EVM_DVN_LZ_ADDRESS, EVM_EXECUTOR_ADDRESS, EVM_EXECUTOR_DECOMPRESSOR_ADDRESS, EVM_EXECUTOR_FEE_LIB_ADDRESS, EVM_OptimismDVNAdapterL1_ADDRESS, EVM_OptimismDVNAdapterL2_ADDRESS, EVM_RECEIVE_ULN301_ADDRESS, EVM_RECEIVE_ULN302_ADDRESS, EVM_SEND_ULN301_ADDRESS, EVM_SEND_ULN302_ADDRESS, EVM_SIMPLE_MESSAGE_LIB_ADDRESS, EVM_TREASURY_ADDRESS, EVM_ULNV2_ADDRESS, EVM_ULNV2_ALT_TOKEN_ADDRESS, EVM_VERIFIER_ADDRESS, EVM_VERIFIER_FEE_LIB_ADDRESS, type EidChainOrDefault, type EidOrDefault, GAS_PER_BYTE, PRICE_FEED_USD_DECIMALS, PriceModelType, ProofType, SOLANA_BLOCKED_MESSAGE_ADDRESS, SOLANA_DVN_ADDRESS, SOLANA_EXECUTOR_ADDRESS, SOLANA_SIMPLE_MESSAGE_LIB_ADDRESS, SOLANA_ULN302_ADDRESS, type WithDefault };
