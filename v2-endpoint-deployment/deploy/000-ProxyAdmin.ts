import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'

import { HardhatRuntimeEnvironment } from 'hardhat/types'


module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deploy } = hre.deployments
    const deployer = `0x462c2AE39B6B0bdB950Deb2BC82082308cF8cB10`

    await deploy('ProxyAdmin', {
        from: deployer,
        args: [deployer],
        log: true,
        waitConfirmations: 1,
        skipIfAlreadyDeployed: false,
        // gasPrice: '0',
    })
    return Promise.resolve(false)
}

module.exports.tags = ['ProxyAdmin', 'test']
