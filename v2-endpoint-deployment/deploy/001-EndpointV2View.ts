import { HardhatRuntimeEnvironment } from 'hardhat/types'
import 'hardhat-deploy'
import { Deployment } from 'hardhat-deploy/dist/types'

// import { isZKSyncBasedChain, networkToChain } from '@layerzerolabs/lz-definitions'
// import { ALT_TOKEN_CHAINS } from '@layerzerolabs/ops-definitions-layerzero'
const hre = require('hardhat')

function getDependencies(): string[] {
    console.log(`Depending on EndpointV2 for ${hre.network.name}`)
    return ['EndpointV2']
}

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    // const { proxyAdmin } = await getNamedAccounts()

    // const { relayer } = await getNamedAccounts()
    const relayer = `0x462c2AE39B6B0bdB950Deb2BC82082308cF8cB10`
    if (!relayer) {
        throw new Error('Relayer address is not defined in namedAccounts')
    }

    const proxyAdmin = `0x462c2AE39B6B0bdB950Deb2BC82082308cF8cB10`

    let endpoint: Deployment
    try {
        endpoint = await deployments.get('EndpointV2')
        console.log('EndpointV2 address:', endpoint.address)
    } catch (error) {
        console.error('Failed to get EndpointV2 deployment:', error)
        throw error
    }

    // const proxyContract = isZKSyncBasedChain(networkToChain(hre.network.name))
    //     ? 'TransparentUpgradeableProxy'
    //     : 'OptimizedTransparentProxy'
    // Asuming lif3 is not a ZKSyncBasedChain
    const proxyContract = 'OptimizedTransparentProxy'

    try {
        await deploy('EndpointV2View', {
            contract: 'contracts/protocol/contracts/EndpointV2View.sol:EndpointV2View',
            from: relayer,
            log: true,
            waitConfirmations: 1,
            // gasPrice: '0',
            // gasLimit: '1000000',
            skipIfAlreadyDeployed: false,
            proxy: {
                // owner: proxyAdmin,
                owner: '0x0804a6e2798F42C7F3c97215DdF958d5500f8ec8',
                proxyContract: proxyContract,
                execute: {
                    init: {
                        methodName: 'initialize',
                        args: [endpoint.address],
                    },
                },
                viaAdminContract: 'DefaultProxyAdmin',
            },
        })
    } catch (error) {
        console.error('Failed to deploy EndpointV2View:', error)
        throw error
    }
}

module.exports.tags = ['EndpointV2View']
module.exports.dependencies = getDependencies()
