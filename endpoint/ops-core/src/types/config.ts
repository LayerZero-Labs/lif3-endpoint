import * as commander from 'commander'

import { Chain, ChainType, EndpointVersion } from '@layerzerolabs/lz-definitions'

import { OpsEnvironment } from './runtime'

export interface OpsBundleUserConfig {
    name: string
    tags: string[]
    path: string
    chains?: Chain[]
    chainTypes?: ChainType[]
    endpointVersion?: EndpointVersion
    alias?: string
    __workspacePath__?: string
}

export interface OpsUserConfig {
    workspaces?: string[]
    // extender is the function that can process the userConfig, and extend the config.
    extenders?: string[]
    // bundle is the UNIT of ops that can be deployed, wired, tested, etc.
    bundles?: OpsBundleUserConfig[]
}

export interface OpsBundleConfig {
    ident: string
    name: string
    tags: string[]
    path: string
    chains?: Chain[]
    chainTypes?: ChainType[]
    endpointVersion?: EndpointVersion
    alias?: string
}

export interface OpsConfig {
    bundles: OpsBundleConfig[]
}

export interface OpsExtenderConfig {
    processConfig: OpsUserConfigProcessor
    buildCommandFamily: OpsCommandFamilyBuilder
}

export type OpsCommandFamilyBuilder = (env: OpsEnvironment) => commander.Command[]
export type OpsUserConfigProcessor = (userConfig: Readonly<OpsUserConfig>, config: OpsConfig) => void
