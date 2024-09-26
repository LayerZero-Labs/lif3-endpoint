import fs from 'fs'

import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { Deployment } from 'hardhat-deploy/dist/types'
import invariant from 'tiny-invariant'
// import invariant from 'tiny-invariant'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'

import {
    getDeployedAddress,
    getDeployedV1Address,
    getUltraLightNodeV2Address,
    getUltraLightNodeV2AltTokenAddress,
} from './util'

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { relayer, proxyAdmin, relayerAdmin } = await getNamedAccounts()

    console.log(`Executor deployer: ${relayer}`)
    console.log(`Executor proxyOwner: ${proxyAdmin}`)
    console.log(`Executor admin: ${relayerAdmin}`)

    const endpointAddr = getDeployedAddress(hre, 'EndpointV2')

    const sendUln301: Deployment = await deployments.get('SendUln301')
    const receiveUln301: Deployment = await deployments.get('ReceiveUln301')
    const sendUln301Address = sendUln301.address
    const receiveUln301Address = receiveUln301.address

    const priceFeed = getDeployedV1Address(hre, 'PriceFeed')
    console.log(`PriceFeed: ${priceFeed}`)
    const sendUln302: Deployment = await deployments.get('SendUln302')
    // only 301, 302 are supported
    const messageLibs = [sendUln302.address]
    if (sendUln301Address !== undefined) {
        messageLibs.push(sendUln301Address)
    }
    // ulnV2
    let ulnV2: string = getUltraLightNodeV2Address(hre)
    if (typeof ulnV2 === 'undefined') {
        console.log(`UltraLightNodeV2 not deployed, try UltraLightNodeV2AltToken`)
        ulnV2 = getUltraLightNodeV2AltTokenAddress(hre)
    }
    if (ulnV2) {
        messageLibs.push(ulnV2)
    } else {
        console.log(`UltraLightNodeV2 and UltraLightNodeV2AltToken both not deployed, skip`)
    }
    console.log(`executor messageLibs: ${messageLibs}`)
    // get the config from ../config.json
    const config = JSON.parse(fs.readFileSync('../config.json', 'utf-8'))
    const roleAdmin = config.executorRoleAdmin
    const admins = config.admins
    admins.push(relayerAdmin)

    invariant(roleAdmin, 'roleAdmin is not set')
    console.log(`Executor roleAdmin: ${roleAdmin}`)

    const proxyContract = 'OptimizedTransparentProxy'

    console.log(`[${hre.network.name}] Executor proxyContract: ${proxyContract}`)

    // let gasPrice = (await hre.ethers.provider.getGasPrice()).mul(3)
    await deploy('Executor', {
        from: relayer,
        log: true,
        waitConfirmations: 1,
        // gasPrice: gasPrice,
        skipIfAlreadyDeployed: false,
        proxy: {
            owner: proxyAdmin,
            proxyContract: proxyContract,
            viaAdminContract: { name: 'ExecutorProxyAdmin', artifact: 'ProxyAdmin' },
            execute: {
                init: {
                    methodName: 'initialize',
                    args: [endpointAddr, receiveUln301Address, messageLibs, priceFeed, roleAdmin, admins],
                },
                onUpgrade: {
                    methodName: 'onUpgrade',
                    args: [receiveUln301Address],
                },
            },
        },
    })
}

module.exports.tags = ['Executor']
module.exports.dependencies = ['PriceFeed', 'ReceiveUln301', 'SendUln301', 'SendUln302']
