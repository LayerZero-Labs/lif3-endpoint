import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { EndpointVersion, networkToEndpointId } from '@layerzerolabs/lz-definitions'

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deploy } = hre.deployments
    const { layerzero } = await hre.getNamedAccounts()
    console.log(`deployer: ${layerzero}`)

    const endpointId = hre.network.name === 'hardhat' ? 1 : networkToEndpointId(hre.network.name, EndpointVersion.V1)
    await deploy('Endpoint', {
        from: layerzero,
        // gasPrice: '0',
        args: [endpointId],
        // if set it to true, will not attempt to deploy
        // even if the contract deployed under the same name is different
        skipIfAlreadyDeployed: true,
        log: true,
        waitConfirmations: 1,
    })
}

module.exports.tags = ['Endpoint', 'test']
