import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction, Deployment } from 'hardhat-deploy/types'
import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'

// this is a deploy script for EndpointV2
// 1. deploy an EndpointV2 with regular hardhat
// 2. if initial deployment (deployment file does not exist), deploy an EndpointV2 with Create3
// 3. update the deployment file with the new address
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const salt = hre.ethers.utils.keccak256(Buffer.from('layerzero-ep-v2')) // never change this

    const { deployments } = hre
    const { deploy } = deployments

    const deployer = `0x462c2AE39B6B0bdB950Deb2BC82082308cF8cB10`
    console.log(`deployer: ${deployer}`)
    console.log(`EndpointV2 deployer: ${deployer}`)
    const endpointId = 10106

    console.log(`EndpointV2 salt: ${salt}`)
    console.log(`EndpointV2 args: [${endpointId}, ${deployer}]`)

    await deploy('EndpointV2', {
        from: deployer,
        // gasPrice: '0',
        // gasLimit: 10000000,
        args: [endpointId, deployer],
        // if set it to true, will not attempt to deploy
        // even if the contract deployed under the same name is different
        skipIfAlreadyDeployed: false,
        log: true,
        waitConfirmations: 1,
    })
}

export default func

func.tags = ['EndpointV2', 'test']
