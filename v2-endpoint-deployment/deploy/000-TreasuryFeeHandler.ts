import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'

import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { getEndpointV1Address } from './util'

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    await deploy('TreasuryFeeHandler', {
        from: deployer,
        args: [getEndpointV1Address(hre)],
        log: true,
        waitConfirmations: 1,
        skipIfAlreadyDeployed: true,
        // gasPrice: '0',
    })
}

module.exports.tags = ['TreasuryFeeHandler']
