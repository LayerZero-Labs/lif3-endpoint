import * as fs from 'fs'

import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

module.exports = async function ({ getNamedAccounts, deployments, network }: HardhatRuntimeEnvironment) {
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    // get the Endpoint address
    const endpoint = await deployments.get('Endpoint')
    const configFile = fs.readFileSync('../config.json', 'utf-8')
    const config = JSON.parse(configFile)
    const endpointId = config.endpointV1Id

    const nonceContract = await deployments.get('NonceContract')

    console.log([endpoint.address, nonceContract.address, endpointId])

    const { address } = await deploy('UltraLightNodeV2', {
        // gasPrice: '0',
        from: deployer,
        args: [endpoint.address, nonceContract.address, endpointId],
        // if set it to true, will not attempt to deploy
        // even if the contract deployed under the same name is different
        skipIfAlreadyDeployed: true,
        log: true,
        waitConfirmations: 1,
    })

    console.log(`address is ${address}`)
}
module.exports.tags = ['UltraLightNodeV2']
module.exports.dependencies = ['Endpoint', 'NonceContract']
