import { Chain, ChainType } from '@layerzerolabs/lz-definitions'

import { OpsConfig, OpsUserConfig } from './config'

export interface OpsEnvironment {
    userConfig: OpsUserConfig
    config: OpsConfig
}
export interface FilterGroup {
    chain?: Chain
    chainType?: ChainType
    tags?: string[]
}
