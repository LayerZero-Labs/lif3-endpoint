import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'
import { HardhatRuntimeEnvironment } from 'hardhat/types'


module.exports = async function ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) {
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    const endpoint = await deployments.get('Endpoint')

    await deploy('NonceContract', {
        // gasPrice: '0',
        from: deployer,
        args: [endpoint.address],
        log: true,
        waitConfirmations: 1,
        skipIfAlreadyDeployed: false,
    })
}

module.exports.tags = ['NonceContract', 'test', 'v2']
module.exports.dependencies = ['Endpoint']
