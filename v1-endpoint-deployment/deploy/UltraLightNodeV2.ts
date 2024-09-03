import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

module.exports = async function ({ getNamedAccounts, deployments, network }: HardhatRuntimeEnvironment) {
    const { deploy } = deployments
    const deployer = `0x462c2AE39B6B0bdB950Deb2BC82082308cF8cB10`

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
        skipIfAlreadyDeployed: true,
        log: true,
        waitConfirmations: 1,
    })
}

// module.exports.skip = () =>
//     new Promise(async (resolve) => {
//         resolve(!isTestnet()) // skip it when its mainnet for now
//     })

module.exports.tags = ['UltraLightNodeV2', 'test', 'v2']
module.exports.dependencies = ['Endpoint', 'NonceContract']