import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

module.exports = async function ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) {
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    const ultraLightNodeV2 = await deployments.get('UltraLightNodeV2')

    await deploy('TreasuryV2', {
        // gasPrice: '0',
        from: deployer,
        args: [ultraLightNodeV2.address],
        log: true,
        waitConfirmations: 1,
        skipIfAlreadyDeployed: true,
    })
}
module.exports.tags = ['TreasuryV2']
module.exports.dependencies = ['UltraLightNodeV2']
