import * as fs from 'fs'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import 'hardhat-deploy'

import { getDeployedV1Address } from './util'
module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { proxyAdmin } = await getNamedAccounts()
    const { deployer } = await getNamedAccounts()

    // get the EndpointV1 address
    const endpointAddr = getDeployedV1Address(hre, 'Endpoint')
    const uln301 = await deployments.get('ReceiveUln301')

    const configFile = fs.readFileSync('../config.json', 'utf-8')
    const config = JSON.parse(configFile)
    const localChainId = config.endpointV2Id

    const proxyContract = 'OptimizedTransparentProxy'

    await deploy('ReceiveUln301View', {
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
                    args: [endpointAddr, localChainId, uln301.address],
                },
            },
        },
    })
}

module.exports.tags = ['ReceiveUln301View']
module.exports.dependencies = ['ReceiveUln301']
// module.exports.skip = async ({ network }: HardhatRuntimeEnvironment) =>
//     new Promise((resolve) => {
//         resolve(ALT_TOKEN_CHAINS.includes(networkToChain(network.name)))
//     })
