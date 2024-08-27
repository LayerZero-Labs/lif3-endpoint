import { HardhatRuntimeEnvironment } from 'hardhat/types'
import 'hardhat-deploy'
import { Deployment } from 'hardhat-deploy/dist/types'

import { isZKSyncBasedChain, networkToChain } from '@layerzerolabs/lz-definitions'
import { ALT_TOKEN_CHAINS } from '@layerzerolabs/ops-definitions-layerzero'

const hre = require('hardhat')

function getDependencies(): string[] {
    const chain = networkToChain(hre.network.name)
    if (ALT_TOKEN_CHAINS.includes(chain)) {
        console.log(`Depending on EndpointV2Alt for ${hre.network.name}`)
        return ['EndpointV2Alt']
    }
    console.log(`Depending on EndpointV2 for ${hre.network.name}`)
    return ['EndpointV2']
}

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { relayer, proxyAdmin } = await getNamedAccounts()

    const endpoint: Deployment = await deployments.get('EndpointV2')

    const proxyContract = isZKSyncBasedChain(networkToChain(hre.network.name))
        ? 'TransparentUpgradeableProxy'
        : 'OptimizedTransparentProxy'

    await deploy('EndpointV2View', {
        from: relayer,
        log: true,
        waitConfirmations: 1,
        // gasPrice: '0',
        // gasLimit: '1000000',
        // skipIfAlreadyDeployed: true,
        proxy: {
            owner: proxyAdmin,
            proxyContract: proxyContract,
            execute: {
                init: {
                    methodName: 'initialize',
                    args: [endpoint.address],
                },
            },
        },
    })
}

module.exports.tags = ['EndpointV2View']
module.exports.dependencies = getDependencies()
