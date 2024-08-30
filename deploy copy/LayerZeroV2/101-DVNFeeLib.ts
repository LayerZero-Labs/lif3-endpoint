import { HardhatRuntimeEnvironment } from 'hardhat/types'

import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'
import { getNativeDecimalsRate } from './configs/deployConfig'

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    // const { deployments, getNamedAccounts, ethers } = hre
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { verifier } = await getNamedAccounts()
    console.log(`DVNFeeLib deployer: ${verifier}`)

    const suffix = process.env.DVNSUFFIX
    let name = 'DVNFeeLib'
    if (suffix) {
        name = `${name}${suffix}`
    }

    const nativeDecimalsRate = getNativeDecimalsRate(hre.network.name)
    console.log(`Native Decimals Rate: ${nativeDecimalsRate}`)

    await deploy(name, {
        contract: 'DVNFeeLib',
        from: verifier,
        args: [nativeDecimalsRate],
        // if set it to true, will not attempt to deploy
        // even if the contract deployed under the same name is different
        skipIfAlreadyDeployed: true,
        log: true,
        waitConfirmations: 1,
        // gasPrice: '0'
    })
    return Promise.resolve(false)
}

module.exports.tags = ['DVNFeeLib', 'test']
