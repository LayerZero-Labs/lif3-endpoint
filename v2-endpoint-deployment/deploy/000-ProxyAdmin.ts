import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'

import { HardhatRuntimeEnvironment } from 'hardhat/types'

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    await deploy('ProxyAdmin', {
        from: deployer,
        args: [deployer],
        log: true,
        waitConfirmations: 1,
        skipIfAlreadyDeployed: true,
        // gasPrice: '0',
    })
    return Promise.resolve(false)
}

module.exports.tags = ['ProxyAdmin']
