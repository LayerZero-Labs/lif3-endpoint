import * as fs from 'fs'
import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'

import { HardhatRuntimeEnvironment } from 'hardhat/types'

import {
    EndpointVersion,
    isNetworkEndpointIdSupported,
    networkToChain,
    networkToEndpointId,
} from '@layerzerolabs/lz-definitions'
// import { ALT_TOKEN_CHAINS } from '@layerzerolabs/ops-definitions-layerzero'

import { getEndpointV1Address } from './util'

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deploy } = hre.deployments
    const { getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()

    const configFile = fs.readFileSync('../config.json', 'utf-8')
    const config = JSON.parse(configFile)
    const localChainId = config.endpointV2Id

    await deploy('ReceiveUln301', {
        from: deployer,
        args: [getEndpointV1Address(hre), localChainId],
        // if set it to true, will not attempt to deploy
        // even if the contract deployed under the same name is different
        skipIfAlreadyDeployed: true,
        log: true,
        waitConfirmations: 1,
        // gasPrice: '0',
    })
}

module.exports.tags = ['ReceiveUln301']
