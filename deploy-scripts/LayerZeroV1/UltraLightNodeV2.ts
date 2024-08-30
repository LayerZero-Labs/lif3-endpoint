import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { EndpointVersion, networkToEndpointId } from '@layerzerolabs/lz-definitions'

module.exports = async function ({ getNamedAccounts, deployments, network }: HardhatRuntimeEnvironment) {
    const { deploy } = deployments
    const { layerzero } = await getNamedAccounts()

    // get the Endpoint address
    const endpoint = await deployments.get('Endpoint')
    const localChainId = network.name === 'hardhat' ? 1 : networkToEndpointId(network.name, EndpointVersion.V1)

    const nonceContract = await deployments.get('NonceContract')

    console.log([endpoint.address, nonceContract.address, localChainId])

    const { address } = await deploy('UltraLightNodeV2', {
        // gasPrice: '0',
        from: layerzero,
        args: [endpoint.address, nonceContract.address, localChainId],
        // if set it to true, will not attempt to deploy
        // even if the contract deployed under the same name is different
        skipIfAlreadyDeployed: true,
        log: true,
        waitConfirmations: 1,
    })
}

// module.exports.skip = () =>
//     new Promise(async (resolve) => {
//         resolve(!isTestnet()) // skip it when its mainnet for now
//     })

module.exports.tags = ['UltraLightNodeV2', 'test', 'v2']
module.exports.dependencies = ['Endpoint', 'NonceContract']
