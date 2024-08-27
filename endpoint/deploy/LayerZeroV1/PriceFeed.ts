import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { isLocalhost } from '@layerzerolabs/hardhat-config'
import { Stage, networkToStage } from '@layerzerolabs/lz-definitions'

const PRICE_UPDATER = {
    [Stage.SANDBOX]: '0x13B6B82D2f5E9b29fa453e3271cAB43Ced089800',
    [Stage.TESTNET]: '0xF5E8A439C599205C1aB06b535DE46681Aed1007a',
    [Stage.MAINNET]: '0x339d413CCEfD986b1B3647A9cfa9CBbE70A30749',
}

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deploy } = hre.deployments
    const { relayer, proxyAdmin } = await hre.getNamedAccounts()

    console.log(`Deployer: ${relayer}`)
    console.log(`ProxyOwner: ${proxyAdmin}`)

    const priceUpdater = isLocalhost(hre.network.name)
        ? hre.ethers.constants.AddressZero
        : PRICE_UPDATER[networkToStage(hre.network.name)]
    console.log(priceUpdater)

    await deploy('PriceFeed', {
        // gasLimit: 5000000,
        // gasPrice: '1000000000', // 25 gwei
        from: relayer,
        log: true,
        waitConfirmations: 1,
        // skipIfAlreadyDeployed: true,
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
module.exports.skip = async ({ network }) =>
    new Promise((resolve) => {
        resolve(network.name !== 'hardhat')
        // only use for tests
    })
