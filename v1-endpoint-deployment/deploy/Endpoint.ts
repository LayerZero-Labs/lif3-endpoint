import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deploy } = hre.deployments
    const deployer = `0x462c2AE39B6B0bdB950Deb2BC82082308cF8cB10`
    console.log(`deployer: ${deployer}`)
    const endpointId = 10106

    await deploy('Endpoint', {
        from: deployer,
        // gasPrice: '0',
        args: [endpointId],
        // if set it to true, will not attempt to deploy
        // even if the contract deployed under the same name is different
        skipIfAlreadyDeployed: true,
        log: true,
        waitConfirmations: 1,
    })
}

module.exports.tags = ['Endpoint', 'test']
