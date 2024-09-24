import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { Deployment } from 'hardhat-deploy/types'

import { isZKSyncBasedChain, networkToChain } from '@layerzerolabs/lz-definitions'

import { getDeployedAddress } from './util'

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { relayer, proxyAdmin } = await getNamedAccounts()
    console.log(`LzExecutor deployer: ${relayer}`)
    console.log(`LzExecutor proxyAdmin: ${proxyAdmin}`)

    const receiveUln302: Deployment = await deployments.get('ReceiveUln302')
    console.log(`receiveUln302: ${receiveUln302.address}`)
    const receiveUln302View: Deployment = await deployments.get('ReceiveUln302View')
    console.log(`receiveUln302View: ${receiveUln302View.address}`)
    const endpointAddr = getDeployedAddress(hre, 'EndpointV2')
    console.log(`endpointAddr: ${endpointAddr}`)

    const proxyContract = isZKSyncBasedChain(networkToChain(hre.network.name))
        ? 'TransparentUpgradeableProxy'
        : 'OptimizedTransparentProxy'
    console.log(`[${hre.network.name}] Executor proxyContract: ${proxyContract}`)
    await deploy('LzExecutor', {
        from: relayer,
        log: true,
        waitConfirmations: 1,
        // gasPrice: '0',
        skipIfAlreadyDeployed: true,
        proxy: {
            owner: proxyAdmin,
            proxyContract: proxyContract,
            viaAdminContract: { name: 'ExecutorProxyAdmin', artifact: 'ProxyAdmin' },
            execute: {
                init: {
                    methodName: 'initialize',
                    args: [receiveUln302.address, receiveUln302View.address, endpointAddr],
                },
            },
        },
    })
}

module.exports.tags = ['LzExecutor']
module.exports.dependencies = ['ReceiveUln302', 'ReceiveUln302View']
