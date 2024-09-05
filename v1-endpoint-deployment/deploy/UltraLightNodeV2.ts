import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

module.exports = async function ({ getNamedAccounts, deployments, network }: HardhatRuntimeEnvironment) {
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    // get the Endpoint address
    const endpoint = await deployments.get('Endpoint')
    const localChainId = 10106

    const nonceContract = await deployments.get('NonceContract')

    console.log([endpoint.address, nonceContract.address, localChainId])

    const { address } = await deploy('UltraLightNodeV2', {
        // gasPrice: '0',
        from: deployer,
        args: [endpoint.address, nonceContract.address, localChainId],
        // if set it to true, will not attempt to deploy
        // even if the contract deployed under the same name is different
        skipIfAlreadyDeployed: false,
        log: true,
        waitConfirmations: 1,
    })

    console.log(`address is ${address}`)
}
module.exports.tags = ['UltraLightNodeV2', 'test', 'v2']
module.exports.dependencies = ['Endpoint', 'NonceContract']
