import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'

import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { EndpointVersion, Environment, networkToEnv } from '@layerzerolabs/lz-definitions'

import { getEndpointV1Address, tryGetDeployedV1Address } from './util'

import * as fs from 'fs';

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deploy } = hre.deployments
    const { getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()

    // Note: Do EndpointV1 deployment first, then move the NonceContract Deployment from the v1 to the v2
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

    const configFile = fs.readFileSync('../config.json', 'utf-8')
    const config = JSON.parse(configFile)
    const endpointId = config.endpointV2Id
    const treasuryGasLimit = ethers.utils.parseEther(config.treasuryGasLimit.toString())
    const treasuryGasForFeeCap = ethers.utils.parseEther(config.treasuryGasForFeeCap.toString())

    await deploy('SendUln301', {
        from: deployer,
        args: [
            getEndpointV1Address(hre),
            treasuryGasLimit,
            treasuryGasForFeeCap,
            nonceContractAddress,
            endpointId,
            treasuryFeeHandler.address,
        ],
        // if set it to true, will not attempt to deploy
        // even if the contract deployed under the same name is different
        skipIfAlreadyDeployed: true,
        log: true,
        waitConfirmations: 1,
        // gasPrice: '0',
    })
}

module.exports.tags = ['SendUln301']
