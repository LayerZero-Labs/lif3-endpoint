import { HardhatRuntimeEnvironment } from 'hardhat/types'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'

import { getDeployedAddress } from './util'

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deploy } = hre.deployments
    const { getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()

    // get the EndpointV2 address
    const endpointAddr = getDeployedAddress(hre, 'EndpointV2')

    // const gasPrice = await hre.ethers.provider.getGasPrice()
    await deploy('ReceiveUln302', {
        from: deployer,
        args: [endpointAddr],
        // if set it to true, will not attempt to deploy
        // even if the contract deployed under the same name is different
        skipIfAlreadyDeployed: false,
        log: true,
        waitConfirmations: 1,
        // gasPrice: '0'
    })
    return Promise.resolve(false)
}

module.exports.tags = ['ReceiveUln302', 'test']
