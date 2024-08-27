import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'

import { HardhatRuntimeEnvironment } from 'hardhat/types'

import {
    EndpointVersion,
    isNetworkEndpointIdSupported,
    networkToChain,
    networkToEndpointId,
} from '@layerzerolabs/lz-definitions'
import { ALT_TOKEN_CHAINS } from '@layerzerolabs/ops-definitions-layerzero'

import { getEndpointV1Address } from './util'

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deploy } = hre.deployments
    const { layerzero } = await hre.getNamedAccounts()

    if (hre.network.name !== 'hardhat' && !isNetworkEndpointIdSupported(hre.network.name, EndpointVersion.V1)) {
        console.log(`network ${hre.network.name} is not supported v1, skip deploy ReceiveUln301`)
        return Promise.resolve(false)
    }

    const localChainId = hre.network.name === 'hardhat' ? 1 : networkToEndpointId(hre.network.name, EndpointVersion.V1)

    await deploy('ReceiveUln301', {
        from: layerzero,
        args: [getEndpointV1Address(hre), localChainId],
        // if set it to true, will not attempt to deploy
        // even if the contract deployed under the same name is different
        skipIfAlreadyDeployed: true,
        log: true,
        waitConfirmations: 1,
        // gasPrice: '0',
    })
    return Promise.resolve(false)
}

module.exports.tags = ['ReceiveUln301', 'test']
module.exports.dependencies = []
module.exports.skip = async ({ network }: HardhatRuntimeEnvironment) =>
    new Promise((resolve) => {
        resolve(ALT_TOKEN_CHAINS.includes(networkToChain(network.name)))
    })
