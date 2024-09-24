import { HardhatRuntimeEnvironment } from 'hardhat/types'
import 'hardhat-deploy'

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    console.log(`Treasury deployer: ${deployer}`)

    await deploy('Treasury', {
        from: deployer,
        args: [],
        // if set it to true, will not attempt to deploy
        // even if the contract deployed under the same name is different
        skipIfAlreadyDeployed: true,
        log: true,
        waitConfirmations: 1,
        // gasPrice: '0'
    })
}

module.exports.tags = ['Treasury']
