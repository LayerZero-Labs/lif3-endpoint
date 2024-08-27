import { HardhatRuntimeEnvironment } from 'hardhat/types'
import 'hardhat-deploy'

import { EndpointVersion, isZKSyncBasedChain, networkToChain, networkToEndpointId } from '@layerzerolabs/lz-definitions'
import { ALT_TOKEN_CHAINS } from '@layerzerolabs/ops-definitions-layerzero'

import { getEndpointV1Address } from './util'
module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { relayer, proxyAdmin } = await getNamedAccounts()

    // get the EndpointV1 address
    const endpointAddr = getEndpointV1Address(hre)
    const uln301 = await deployments.get('ReceiveUln301')

    const localChainId = hre.network.name === 'hardhat' ? 1 : networkToEndpointId(hre.network.name, EndpointVersion.V1)

    const proxyContract = isZKSyncBasedChain(networkToChain(hre.network.name))
        ? 'TransparentUpgradeableProxy'
        : 'OptimizedTransparentProxy'

    await deploy('ReceiveUln301View', {
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
                    args: [endpointAddr, localChainId, uln301.address],
                },
            },
        },
    })
    return Promise.resolve(false)
}

module.exports.tags = ['ReceiveUln301View']
module.exports.dependencies = ['ReceiveUln301']
module.exports.skip = async ({ network }: HardhatRuntimeEnvironment) =>
    new Promise((resolve) => {
        resolve(ALT_TOKEN_CHAINS.includes(networkToChain(network.name)))
    })
