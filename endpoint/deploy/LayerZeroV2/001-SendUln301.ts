import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'

import { HardhatRuntimeEnvironment } from 'hardhat/types'

import {
    EndpointVersion,
    Environment,
    isNetworkEndpointIdSupported,
    networkToChain,
    networkToEndpointId,
    networkToEnv,
    networkToStage,
} from '@layerzerolabs/lz-definitions'
import { ALT_TOKEN_CHAINS } from '@layerzerolabs/ops-definitions-layerzero'
import { LayerZeroConfigManager } from '@layerzerolabs/ops-utilities'

import { TREASURY_GAS_FOR_FEE_CAP, TREASURY_GAS_LIMIT } from './configs/deployConfig'
import { getEndpointV1Address, tryGetDeployedV1Address } from './util'

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deploy } = hre.deployments
    const { layerzero } = await hre.getNamedAccounts()

    if (hre.network.name !== 'hardhat' && !isNetworkEndpointIdSupported(hre.network.name, EndpointVersion.V1)) {
        console.log(`network ${hre.network.name} is not supported v1, skip deploy SendUln301`)
        return Promise.resolve(false)
    }

    const stage = networkToStage(hre.network.name)
    const chain = networkToChain(hre.network.name)

    const treasuryGasLimitConfigManager = new LayerZeroConfigManager(TREASURY_GAS_LIMIT)
    const treasuryGasLimit = treasuryGasLimitConfigManager.get(stage, [chain, 'default'])

    const treasuryGasForFeeCapConfigManager = new LayerZeroConfigManager(TREASURY_GAS_FOR_FEE_CAP)
    const treasuryGasForFeeCap = treasuryGasForFeeCapConfigManager.get(stage, [chain, 'default'])

    const localChainId = hre.network.name === 'hardhat' ? 1 : networkToEndpointId(hre.network.name, EndpointVersion.V1)

    // re-use endpointV1 NonceContract
    let nonceContractAddress = tryGetDeployedV1Address(hre, 'NonceContract')
    if (!nonceContractAddress) {
        const env = networkToEnv(hre.network.name, EndpointVersion.V1)
        if (env !== Environment.LOCAL) {
            throw new Error(`NonceContract not deployed in V1`)
        }
        // for localnet and NonceContract is not found in V1, use NonceContractMock instead
        nonceContractAddress = (await hre.deployments.get('NonceContractMock')).address
    }
    const treasuryFeeHandler = await hre.deployments.get('TreasuryFeeHandler')

    await deploy('SendUln301', {
        from: layerzero,
        args: [
            getEndpointV1Address(hre),
            treasuryGasLimit,
            treasuryGasForFeeCap,
            nonceContractAddress,
            localChainId,
            treasuryFeeHandler.address,
        ],
        // if set it to true, will not attempt to deploy
        // even if the contract deployed under the same name is different
        skipIfAlreadyDeployed: true,
        log: true,
        waitConfirmations: 1,
        // gasPrice: '0',
    })
    return Promise.resolve(false)
}

module.exports.tags = ['SendUln301', 'test']
module.exports.dependencies = ['TreasuryFeeHandler', 'NonceContractMock']
module.exports.skip = async ({ network }: HardhatRuntimeEnvironment) =>
    new Promise((resolve) => {
        resolve(ALT_TOKEN_CHAINS.includes(networkToChain(network.name)))
    })
