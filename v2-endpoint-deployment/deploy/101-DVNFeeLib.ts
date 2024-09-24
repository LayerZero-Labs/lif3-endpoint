import { HardhatRuntimeEnvironment } from 'hardhat/types'

const { BigNumber } = require('ethers')

import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deployments } = hre
    const { deploy } = deployments
    const { getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()

    console.log(`DVNFeeLib deployer: ${deployer}`)

    const suffix = process.env.DVNSUFFIX
    let name = 'DVNFeeLib'
    if (suffix) {
        name = `${name}${suffix}`
    }

    // Use 10^18 to represent the native token's decimal places (e.g., 1 ETH = 10^18 wei)
    const nativeDecimalsRate = BigNumber.from(10).pow(18)
    console.log(`Native Decimals Rate: ${nativeDecimalsRate}`)

    await deploy(name, {
        contract: 'DVNFeeLib',
        from: deployer,
        args: [nativeDecimalsRate],
        // if set it to true, will not attempt to deploy
        // even if the contract deployed under the same name is different
        skipIfAlreadyDeployed: true,
        log: true,
        waitConfirmations: 1,
        // gasPrice: '0'
    })
}

module.exports.tags = ['DVNFeeLib']
