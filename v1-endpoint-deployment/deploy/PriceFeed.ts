import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deploy } = hre.deployments
    const { proxyAdmin, relayer } = await hre.getNamedAccounts()

    console.log(`Deployer: ${relayer}`)
    console.log(`ProxyOwner: ${proxyAdmin}`)

    const priceUpdater = hre.ethers.constants.AddressZero

    await deploy('PriceFeed', {
        // gasLimit: 5000000,
        // gasPrice: '1000000000', // 25 gwei
        from: relayer,
        log: true,
        waitConfirmations: 1,
        skipIfAlreadyDeployed: false,
        proxy: {
            owner: proxyAdmin,
            proxyContract: 'OptimizedTransparentProxy',
            execute: {
                init: {
                    methodName: 'initialize',
                    args: [priceUpdater],
                },
                onUpgrade: {
                    methodName: 'onUpgrade',
                    args: [],
                },
            },
        },
    })
}
module.exports.tags = ['PriceFeed', 'test']
