import { HardhatRuntimeEnvironment } from 'hardhat/types'
import 'hardhat-deploy'

import { isZKSyncBasedChain, networkToChain } from '@layerzerolabs/lz-definitions'

import { getDeployedAddress } from './util'

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { relayer, proxyAdmin } = await getNamedAccounts()

    // get the EndpointV2 address
    const endpointAddr = getDeployedAddress(hre, 'EndpointV2')
    const uln302 = await deployments.get('ReceiveUln302')

    const proxyContract = isZKSyncBasedChain(networkToChain(hre.network.name))
        ? 'TransparentUpgradeableProxy'
        : 'OptimizedTransparentProxy'

    await deploy('ReceiveUln302View', {
        from: relayer,
        log: true,
        waitConfirmations: 1,
        // gasPrice: '0',
        // skipIfAlreadyDeployed: true,
        proxy: {
            owner: proxyAdmin,
            proxyContract: proxyContract,
            viaAdminContract: { name: 'ExecutorProxyAdmin', artifact: 'ProxyAdmin' },
            execute: {
                init: {
                    methodName: 'initialize',
                    args: [endpointAddr, uln302.address],
                },
            },
        },
    })
    return Promise.resolve(false)
}

module.exports.tags = ['ReceiveUln302View']
module.exports.dependencies = ['ReceiveUln302']
