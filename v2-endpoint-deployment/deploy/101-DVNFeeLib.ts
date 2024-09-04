import { HardhatRuntimeEnvironment } from 'hardhat/types'

const { BigNumber } = require('ethers')

import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    // const { deployments, getNamedAccounts, ethers } = hre
    const { deployments } = hre
    const { deploy } = deployments
    const deployer = `0x462c2AE39B6B0bdB950Deb2BC82082308cF8cB10`

    console.log(`DVNFeeLib deployer: ${deployer}`)

    const suffix = process.env.DVNSUFFIX
    let name = 'DVNFeeLib'
    if (suffix) {
        name = `${name}${suffix}`
    }

    const nativeDecimalsRate = BigNumber.from('1000000000000000000')
    console.log(`Native Decimals Rate: ${nativeDecimalsRate}`)

    await deploy(name, {
        contract: 'DVNFeeLib',
        from: deployer,
        args: [nativeDecimalsRate],
        // if set it to true, will not attempt to deploy
        // even if the contract deployed under the same name is different
        skipIfAlreadyDeployed: false,
        log: true,
        waitConfirmations: 1,
        // gasPrice: '0'
    })
    return Promise.resolve(false)
}

module.exports.tags = ['DVNFeeLib', 'test']
