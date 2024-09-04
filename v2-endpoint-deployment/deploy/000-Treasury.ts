// import { HardhatRuntimeEnvironment } from 'hardhat/types'
// import 'hardhat-deploy'

// module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
//     const { deployments } = hre
//     const { deploy } = deployments

//     const deployer = `0x462c2AE39B6B0bdB950Deb2BC82082308cF8cB10`
//     const endpointId = 10106
//     console.log(`Treasury deployer: ${deployer}`)

//     // const uln: Deployment = await deployments.get('UltraLightNode302')

//     await deploy('Treasury', {
//         from: deployer,
//         args: [],
//         // if set it to true, will not attempt to deploy
//         // even if the contract deployed under the same name is different
//         skipIfAlreadyDeployed: true,
//         log: true,
//         waitConfirmations: 1,
//         // gasPrice: '0'
//     })
//     return Promise.resolve(false)
// }

// module.exports.tags = ['Treasury', 'test']

import { ethers } from 'hardhat'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import 'hardhat-deploy'

module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<void> {
    const { deployments, getNamedAccounts } = hre
    const { deploy, log, getOrNull } = deployments
    const { deployer } = await getNamedAccounts()
    const endpointId = 10106
    log(`Treasury deployer: ${deployer}`)

    // Check if Treasury is already deployed
    const existingTreasury = await getOrNull('Treasury')
    if (existingTreasury) {
        log(`Existing Treasury found at ${existingTreasury.address}`)
        log('Forcing new deployment...')
    }

    // Deploy the Treasury contract
    const treasuryDeployment = await deploy('Treasury', {
        from: deployer,
        args: [],
        skipIfAlreadyDeployed: false, // Force deployment even if it exists
        log: true,
        waitConfirmations: 1,
    })

    // Check if the deployment was successful
    if (treasuryDeployment.newlyDeployed) {
        log(`New Treasury deployed at ${treasuryDeployment.address}`)

        // Verify the contract on the blockchain explorer (if supported)
        if (hre.network.config.verify) {
            log('Verifying contract...')
            try {
                await hre.run('verify:verify', {
                    address: treasuryDeployment.address,
                    constructorArguments: [],
                })
                log('Contract verified successfully')
            } catch (error) {
                log('Error verifying contract:', error)
            }
        }

        // Perform additional checks
        const treasuryContract = await ethers.getContractAt('Treasury', treasuryDeployment.address)

        // Example: Check if the contract has the expected functions
        const functions = ['someFunction', 'anotherFunction'] // Replace with actual function names
        for (const func of functions) {
            if (typeof treasuryContract[func] === 'function') {
                log(`Function ${func} exists`)
            } else {
                log(`Warning: Function ${func} not found`)
            }
        }

        // Example: Call a view function to check initial state
        // const initialState = await treasuryContract.someViewFunction()
        // log(`Initial state: ${initialState}`)
    } else {
        log(`Unexpected: Treasury not deployed. Please check your deployment settings.`)
    }
}

module.exports.tags = ['Treasury', 'test']