import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { networkToChain, networkToStage } from '@layerzerolabs/lz-definitions'
import { LayerZeroConfigManager } from '@layerzerolabs/ops-utilities'

import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'
import { TREASURY_GAS_FOR_FEE_CAP, TREASURY_GAS_LIMIT } from './configs/deployConfig'
import { getDeployedAddress } from './util'

// config

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deploy } = hre.deployments
    const { layerzero } = await hre.getNamedAccounts()

    const stage = networkToStage(hre.network.name)
    const chain = networkToChain(hre.network.name)

    const treasuryGasLimitConfigManager = new LayerZeroConfigManager(TREASURY_GAS_LIMIT)
    const treasuryGasLimit = treasuryGasLimitConfigManager.get(stage, [chain, 'default'])

    const treasuryGasForFeeCapConfigManager = new LayerZeroConfigManager(TREASURY_GAS_FOR_FEE_CAP)
    const treasuryGasForFeeCap = treasuryGasForFeeCapConfigManager.get(stage, [chain, 'default'])

    console.log(
        `[${hre.network.name}] SendUln302 treasuryGasLimit: ${treasuryGasLimit}, treasuryGasForFeeCap: ${treasuryGasForFeeCap}`
    )
    if (!treasuryGasLimit || treasuryGasLimit === '0' || !treasuryGasForFeeCap || treasuryGasForFeeCap === 0) {
        throw Error(`[${hre.network.name}] SendUln302 MUST configure non zero treasuryGasLimit & treasuryGasForFeeCap`)
    }

    // get the EndpointV2 address
    const endpointAddr = getDeployedAddress(hre, 'EndpointV2')

    // const gasPrice = (await hre.ethers.provider.getGasPrice()).mul(15).div(10)
    await deploy('SendUln302', {
        from: layerzero,
        args: [endpointAddr, treasuryGasLimit, treasuryGasForFeeCap],
        skipIfAlreadyDeployed: true,
        log: true,
        waitConfirmations: 1,
        // gasPrice: '0',
    })
    return Promise.resolve(false)
}

module.exports.tags = ['SendUln302', 'test']
