import { HardhatRuntimeEnvironment } from 'hardhat/types'
import 'hardhat-deploy'

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deployments } = hre
    const { deploy } = deployments

    const deployer = `0x462c2AE39B6B0bdB950Deb2BC82082308cF8cB10`

    console.log(`Treasury deployer: ${deployer}`)

    // const uln: Deployment = await deployments.get('UltraLightNode302')

    await deploy('Treasury', {
        from: deployer,
        args: [],
        // if set it to true, will not attempt to deploy
        // even if the contract deployed under the same name is different
        skipIfAlreadyDeployed: false,
        log: true,
        waitConfirmations: 1,
        // gasPrice: '0'
    })
    return Promise.resolve(false)
}

module.exports.tags = ['Treasury', 'test']
