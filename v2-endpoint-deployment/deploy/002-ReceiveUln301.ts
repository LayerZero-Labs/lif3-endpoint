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
    const deployer = `0x462c2AE39B6B0bdB950Deb2BC82082308cF8cB10`

    const localChainId = 10106

    await deploy('ReceiveUln301', {
        from: deployer,
        args: [getEndpointV1Address(hre), localChainId],
        // if set it to true, will not attempt to deploy
        // even if the contract deployed under the same name is different
        skipIfAlreadyDeployed: false,
        log: true,
        waitConfirmations: 1,
        // gasPrice: '0',
    })
    return Promise.resolve(false)
}

module.exports.tags = ['ReceiveUln301', 'test']
