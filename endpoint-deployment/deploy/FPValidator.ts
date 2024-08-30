import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'
import { addresses as bridgeAddresses } from '@stargatefinance/stg-evm-v1/deployed/Bridge'
import { addresses as stargateTokenAddresses } from '@stargatefinance/stg-evm-v1/deployed/StargateToken'
import { HardhatRuntimeEnvironment } from 'hardhat/types'


module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deploy } = hre.deployments
    const { layerzero } = await hre.getNamedAccounts()

    const endpointId = 10106

    const bridgeAddr = bridgeAddresses[hre.network.name] || hre.ethers.constants.AddressZero
    const stgAddr = stargateTokenAddresses[hre.network.name] || hre.ethers.constants.AddressZero

    console.table({
        Deployer: layerzero,
        Network: hre.network.name,
        'Stargate Bridge Address': bridgeAddr,
        'Stargate Address': stgAddr,
        'Endpoint ID': endpointId,
    })

    await deploy('FPValidator', {
        from: layerzero,
        // gasPrice: '0',
        args: [bridgeAddr, stgAddr],
        log: true,
        waitConfirmations: 1,
        skipIfAlreadyDeployed: true,
    })
}

module.exports.tags = ['FPValidator', 'test']
