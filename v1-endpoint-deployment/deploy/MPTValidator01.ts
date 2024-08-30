import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'
import { constants } from 'ethers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deploy } = hre.deployments

    const deployer = `0x462c2AE39B6B0bdB950Deb2BC82082308cF8cB10`
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

    await deploy('MPTValidator01', {
        from: deployer,
        // gasPrice: '0',
        args: [bridgeAddr, stgAddr],
        log: true,
        waitConfirmations: 1,
        skipIfAlreadyDeployed: true,
    })
}
module.exports.tags = ['MPTValidator01', 'test']
