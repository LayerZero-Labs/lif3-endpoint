import { ethers } from 'ethers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { relayer } = await getNamedAccounts()
    console.log(`ExecutorFeeLib deployer: ${relayer}`)

    const nativeDecimalsRate = ethers.utils.parseUnits('1', 18).toString()
    console.log(`Native Decimals Rate: ${nativeDecimalsRate}`)

    await deploy('ExecutorFeeLib', {
        from: relayer,
        args: [nativeDecimalsRate],
        // if set it to true, will not attempt to deploy
        // even if the contract deployed under the same name is different
        skipIfAlreadyDeployed: false,
        log: true,
        waitConfirmations: 1,
        // gasPrice: '0',
    })
}

module.exports.tags = ['ExecutorFeeLib', 'test']
