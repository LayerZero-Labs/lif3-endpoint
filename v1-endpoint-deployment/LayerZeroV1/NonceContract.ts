import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

module.exports = async function ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) {
    const { deploy } = deployments
    const { layerzero } = await getNamedAccounts()

    const endpoint = await deployments.get('Endpoint')

    await deploy('NonceContract', {
        // gasPrice: '0',
        from: layerzero,
        args: [endpoint.address],
        log: true,
        waitConfirmations: 1,
        skipIfAlreadyDeployed: true,
    })
}

// module.exports.skip = () =>
//     new Promise(async (resolve) => {
//         resolve(!isTestnet()) // skip it when its mainnet for now
//     })

module.exports.tags = ['NonceContract', 'test', 'v2']
module.exports.dependencies = ['Endpoint']
