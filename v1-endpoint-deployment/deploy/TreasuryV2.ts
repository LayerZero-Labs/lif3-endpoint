import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

module.exports = async function ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) {
    const { deploy } = deployments
    const deployer = `0x462c2AE39B6B0bdB950Deb2BC82082308cF8cB10`

    const ultraLightNodeV2 = await deployments.get('UltraLightNodeV2')

    await deploy('TreasuryV2', {
        // gasPrice: '0',
        from: deployer,
        args: [ultraLightNodeV2.address],
        log: true,
        waitConfirmations: 1,
        skipIfAlreadyDeployed: false,
    })
}

module.exports.tags = ['TreasuryV2', 'test', 'v2']
module.exports.dependencies = ['UltraLightNodeV2']
