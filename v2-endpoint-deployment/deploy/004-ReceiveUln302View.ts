import { HardhatRuntimeEnvironment } from 'hardhat/types'
import 'hardhat-deploy'

import { getDeployedAddress } from './util'

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    const proxyAdmin = deployer
    console.log(`proxyAdmin: ${proxyAdmin}`)
    // get the EndpointV2 address
    const endpointAddr = getDeployedAddress(hre, 'EndpointV2')
    const uln302 = await deployments.get('ReceiveUln302')

    const proxyContract = 'OptimizedTransparentProxy'

    await deploy('ReceiveUln302View', {
        from: deployer,
        log: true,
        waitConfirmations: 1,
        // gasPrice: '0',
        skipIfAlreadyDeployed: false,
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
