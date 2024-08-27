import { HardhatRuntimeEnvironment } from 'hardhat/types'
import 'hardhat-deploy'

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { layerzero } = await getNamedAccounts()
    console.log(`Treasury deployer: ${layerzero}`)

    // const uln: Deployment = await deployments.get('UltraLightNode302')

    await deploy('Treasury', {
        from: layerzero,
        args: [],
        // if set it to true, will not attempt to deploy
        // even if the contract deployed under the same name is different
        skipIfAlreadyDeployed: true,
        log: true,
        waitConfirmations: 1,
        // gasPrice: '0'
    })
    return Promise.resolve(false)
}

module.exports.tags = ['Treasury', 'test']
