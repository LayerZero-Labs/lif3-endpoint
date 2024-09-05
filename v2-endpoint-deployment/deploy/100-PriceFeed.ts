import { HardhatRuntimeEnvironment } from 'hardhat/types'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deploy } = hre.deployments
    const { relayer, proxyAdmin } = await hre.getNamedAccounts()

    console.log(`[${hre.network.name}] PriceFeed deployer: ${relayer}`)
    console.log(`[${hre.network.name}] PriceFeed proxyOwner: ${proxyAdmin}`)
    // const priceUpdater = priceUpdaterConfig[networkToStage(hre.network.name)] ?? hre.ethers.constants.AddressZero
    const priceUpdater = hre.ethers.constants.AddressZero
    console.log(`[${hre.network.name}] PriceFeed priceUpdater: ${priceUpdater}`)

    const proxyContract = 'OptimizedTransparentProxy'
    console.log(`[${hre.network.name}] PriceFeed proxyContract: ${proxyContract}`)

    // let gasPrice = (await hre.ethers.provider.getGasPrice()).mul(3)
    await deploy('PriceFeed', {
        from: relayer,
        // gasPrice: gasPrice,
        log: true,
        waitConfirmations: 1,
        skipIfAlreadyDeployed: false,
        proxy: {
            owner: proxyAdmin,
            proxyContract: proxyContract,
            viaAdminContract: { name: 'PriceFeedProxyAdmin', artifact: 'ProxyAdmin' },
            execute: {
                init: {
                    methodName: 'initialize',
                    args: [priceUpdater],
                },
            },
        },
    })
    return Promise.resolve(false)
}
module.exports.tags = ['PriceFeed', 'test']
