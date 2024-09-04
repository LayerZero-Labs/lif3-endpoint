import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'

import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { EndpointVersion, Environment, isNetworkEndpointIdSupported, networkToEnv } from '@layerzerolabs/lz-definitions'

import { getEndpointV1Address, tryGetDeployedV1Address } from './util'

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deploy } = hre.deployments
    const deployer = `0x462c2AE39B6B0bdB950Deb2BC82082308cF8cB10`

    if (hre.network.name !== 'hardhat' && !isNetworkEndpointIdSupported(hre.network.name, EndpointVersion.V1)) {
        console.log(`network ${hre.network.name} is not supported v1, skip deploy SendUln301`)
        return Promise.resolve(false)
    }
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

    const treasuryGasLimit = 200000
    const treasuryGasForFeeCap = 100000
    const localChainId = 10106

    await deploy('SendUln301', {
        from: deployer,
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
        skipIfAlreadyDeployed: false,
        log: true,
        waitConfirmations: 1,
        // gasPrice: '0',
    })
    return Promise.resolve(false)
}

module.exports.tags = ['SendUln301', 'test']
// module.exports.dependencies = ['TreasuryFeeHandler', 'NonceContractMock']
// module.exports.skip = async ({ network }: HardhatRuntimeEnvironment) =>
//     new Promise((resolve) => {
//         resolve(ALT_TOKEN_CHAINS.includes(networkToChain(network.name)))
//     })
