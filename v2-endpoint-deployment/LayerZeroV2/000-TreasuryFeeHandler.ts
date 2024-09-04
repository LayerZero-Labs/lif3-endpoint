import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'

import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { getEndpointV1Address } from './util'

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deploy } = hre.deployments
    const { layerzero } = await hre.getNamedAccounts()

    await deploy('TreasuryFeeHandler', {
        from: layerzero,
        args: [getEndpointV1Address(hre)],
        log: true,
        waitConfirmations: 1,
        skipIfAlreadyDeployed: true,
        // gasPrice: '0',
    })
    return Promise.resolve(false)
}

module.exports.tags = ['TreasuryFeeHandler', 'test']
