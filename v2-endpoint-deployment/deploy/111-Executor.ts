import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { Deployment } from 'hardhat-deploy/dist/types'
// import invariant from 'tiny-invariant'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'

import {
    EndpointVersion,
    Environment,
    isNetworkEndpointIdSupported,
    isZKSyncBasedChain,
    networkToChain,
    networkToEnv,
    networkToStage,
} from '@layerzerolabs/lz-definitions'

import { EXECUTOR_ADMINS, EXECUTOR_ROLE_ADMIN } from './configs/deployConfig'
import { getDeployedAddress, getUltraLightNodeV2Address, getUltraLightNodeV2AltTokenAddress } from './util'

// config
const ROLE_ADMIN = EXECUTOR_ROLE_ADMIN

const ADMINS = EXECUTOR_ADMINS

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { relayer, proxyAdmin, relayerAdmin } = await getNamedAccounts()
    // invariant(relayer, 'relayer is not set')
    console.log(`Executor deployer: ${relayer}`)
    // invariant(proxyAdmin, 'proxyAdmin is not set')
    console.log(`Executor proxyOwner: ${proxyAdmin}`)
    // invariant(relayerAdmin, 'relayerAdmin is not set')
    console.log(`Executor admin: ${relayerAdmin}`)

    const endpointAddr = getDeployedAddress(hre, 'EndpointV2')

    const sendUln301: Deployment = await deployments.get('SendUln301')
    const receiveUln301: Deployment = await deployments.get('ReceiveUln301')
    const sendUln301Address = sendUln301.address
    const receiveUln301Address = receiveUln301.address

    const priceFeed: Deployment = await deployments.get('PriceFeed')
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

    const stage = networkToStage(hre.network.name)
    let roleAdmin = ROLE_ADMIN[stage]
    const admins = [...ADMINS[stage]]
    admins.push(relayerAdmin)

    // for local test
    if (networkToEnv(hre.network.name, EndpointVersion.V2) === Environment.LOCAL) {
        const { relayerRoleAdmin } = await getNamedAccounts()
        roleAdmin = relayerRoleAdmin
    }
    // invariant(roleAdmin, 'roleAdmin is not set')
    console.log(`Executor roleAdmin: ${roleAdmin}`)

    const proxyContract = isZKSyncBasedChain(networkToChain(hre.network.name))
        ? 'TransparentUpgradeableProxy'
        : 'OptimizedTransparentProxy'

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
                    args: [endpointAddr, receiveUln301Address, messageLibs, priceFeed.address, roleAdmin, admins],
                },
                onUpgrade: {
                    methodName: 'onUpgrade',
                    args: [receiveUln301Address],
                },
            },
        },
    })
}

module.exports.tags = ['Executor', 'test']
module.exports.dependencies = ['PriceFeed', 'ReceiveUln301', 'SendUln301', 'SendUln302']
