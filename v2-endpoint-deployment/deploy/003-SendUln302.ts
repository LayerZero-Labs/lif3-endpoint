import * as fs from 'fs'

import { ethers } from 'ethers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'
import { getDeployedAddress } from './util'

// config

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deploy } = hre.deployments
    const { getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()

    const configFile = fs.readFileSync('../config.json', 'utf-8')
    const config = JSON.parse(configFile)
    const treasuryGasLimit = ethers.utils.parseEther(config.treasuryGasLimit.toString())
    const treasuryGasForFeeCap = ethers.utils.parseEther(config.treasuryGasForFeeCap.toString())

    // get the EndpointV2 address
    const endpointAddr = getDeployedAddress(hre, 'EndpointV2')

    // Deploy SendUln302
    const deployResult = await deploy('SendUln302', {
        from: deployer,
        args: [endpointAddr, treasuryGasLimit, treasuryGasForFeeCap],
        skipIfAlreadyDeployed: true,
        log: true,
        waitConfirmations: 1,
        // gasPrice: '0',
    })

    if (deployResult.newlyDeployed) {
        console.log('Contract was newly deployed.')
    } else {
        console.log('Contract was not newly deployed.')
    }
}

module.exports.tags = ['SendUln302']
