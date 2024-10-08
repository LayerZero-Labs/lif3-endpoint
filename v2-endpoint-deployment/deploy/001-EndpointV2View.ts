import { HardhatRuntimeEnvironment } from 'hardhat/types'
import 'hardhat-deploy'
import { Deployment } from 'hardhat-deploy/dist/types'

const hre = require('hardhat')

function getDependencies(): string[] {
    console.log(`Depending on EndpointV2 for ${hre.network.name}`)
    return ['EndpointV2']
}

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    const proxyAdmin = deployer

    let endpoint: Deployment
    try {
        endpoint = await deployments.get('EndpointV2')
        console.log('EndpointV2 address:', endpoint.address)
    } catch (error) {
        console.error('Failed to get EndpointV2 deployment:', error)
        throw error
    }

    const proxyContract = 'OptimizedTransparentProxy'

    try {
        await deploy('EndpointV2View', {
            contract: 'contracts/protocol/contracts/EndpointV2View.sol:EndpointV2View',
            from: deployer,
            log: true,
            waitConfirmations: 1,
            // gasPrice: '0',
            // gasLimit: '1000000',
            skipIfAlreadyDeployed: false,
            proxy: {
                owner: proxyAdmin,
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
