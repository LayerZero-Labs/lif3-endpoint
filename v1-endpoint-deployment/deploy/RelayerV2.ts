import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'

import { ethers } from 'ethers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { Chain, EndpointVersion, networkToChain, networkToEndpointId } from '@layerzerolabs/lz-definitions'

import { getPriceFeedV2Address } from './utils'

export const NATIVE_DECIMALS_RATE: { [chain in Chain]?: string } = {
    [Chain.TRON]: ethers.utils.parseUnits('1', 6).toString(),
    [Chain.TRONDEV]: ethers.utils.parseUnits('1', 6).toString(),
    [Chain.HEDERA]: ethers.utils.parseUnits('1', 8).toString(),
}
export function getNativeDecimalsRate(networkName: string): string {
    return NATIVE_DECIMALS_RATE[networkToChain(networkName)] ?? ethers.utils.parseUnits('1', 18).toString()
}

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deploy } = hre.deployments
    const { relayer, proxyAdmin } = await hre.getNamedAccounts()

    const ultraLightNodeV2 = (await hre.deployments.get('UltraLightNodeV2')).address
    const priceFeedAddr = getPriceFeedV2Address(hre)

    console.log(`[${hre.network.name}] PriceFeed Address: ${priceFeedAddr}`)

    let gasLimit = 5242880 // arcana-testnet is the lowest ive seen @ 5242880 block gasLimit
    const endpointId = hre.network.name === 'hardhat' ? 1 : networkToEndpointId(hre.network.name, EndpointVersion.V1)
    if ([10010, 20010].includes(endpointId)) {
        gasLimit = 30000000 // arbitrum requires >8m
    }

    // by default use whats configured
    const bridgeAddr = hre.ethers.constants.AddressZero
    const composerAddr = hre.ethers.constants.AddressZero

    // print the FINAL bridge and composer address during deployment/upgrade
    console.log(`[${hre.network.name}] Stargate Bridge Address: ${bridgeAddr}`)
    console.log(`[${hre.network.name}] Stargate Composer Address: ${composerAddr}`)

    const nativeDecimalsRate = getNativeDecimalsRate(hre.network.name)

    console.log('Constructor Args')
    console.log({ ultraLightNodeV2, priceFeedAddr, bridgeAddr, composerAddr, nativeDecimalsRate })

    await deploy('RelayerV2', {
        from: relayer,
        // gasPrice: '0',
        log: true,
        waitConfirmations: 1,
        // skipIfAlreadyDeployed: true, // if you set to true, it cant/wont upgrade
        proxy: {
            owner: proxyAdmin,
            proxyContract: 'OptimizedTransparentProxy',
            execute: {
                init: {
                    methodName: 'initialize',
                    args: [ultraLightNodeV2, priceFeedAddr, bridgeAddr, composerAddr, nativeDecimalsRate],
                },
                onUpgrade: {
                    methodName: 'onUpgrade',
                    args: [bridgeAddr, composerAddr, nativeDecimalsRate],
                },
            },
        },
    })
}

module.exports.tags = ['RelayerV2', 'test', 'v2']
module.exports.dependencies = ['UltraLightNodeV2']
