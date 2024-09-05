import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'
import { constants } from 'ethers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deploy } = hre.deployments
    const { getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()
    const endpointId = 10106

    const bridgeAddr = constants.AddressZero
    const stgAddr = constants.AddressZero

    console.table({
        Deployer: deployer,
        Network: hre.network.name,
        'Stargate Bridge Address': bridgeAddr,
        'Stargate Address': stgAddr,
        'Endpoint ID': endpointId,
    })

    await deploy('FPValidator', {
        from: deployer,
        // gasPrice: '0',
        args: [bridgeAddr, stgAddr],
        log: true,
        waitConfirmations: 1,
        skipIfAlreadyDeployed: true,
    })
}

module.exports.tags = ['FPValidator', 'test']
