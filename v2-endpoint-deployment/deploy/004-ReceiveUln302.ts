import { HardhatRuntimeEnvironment } from 'hardhat/types'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'

import { getDeployedAddress } from './util'

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deploy } = hre.deployments
    const { getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()

    // get the EndpointV2 address
    const endpointAddr = getDeployedAddress(hre, 'EndpointV2')

    await deploy('ReceiveUln302', {
        from: deployer,
        args: [endpointAddr],
        // if set it to true, will not attempt to deploy
        // even if the contract deployed under the same name is different
        skipIfAlreadyDeployed: true,
        log: true,
        waitConfirmations: 1,
        // gasPrice: '0'
    })
}

module.exports.tags = ['ReceiveUln302']
