// import { HardhatRuntimeEnvironment } from 'hardhat/types'
// import 'hardhat-deploy'
// import '@nomiclabs/hardhat-ethers'
// import { Deployment } from 'hardhat-deploy/dist/types'

// import {
//     EndpointVersion,
//     Environment,
//     isNetworkEndpointIdSupported,
//     networkToEndpointId,
//     networkToEnv,
//     networkToStage,
// } from '@layerzerolabs/lz-definitions'

// import { supportedDVNDeployConfig } from './configs/dvn'
// import { getUltraLightNodeV2Address, getUltraLightNodeV2AltTokenAddress } from './util'

// function getConfigForSuffix(stage: string, suffix?: string) {
//     if (suffix === undefined) {
//         suffix = 'default'
//     }
//     suffix = suffix.toLowerCase()
//     const config = supportedDVNDeployConfig[stage][suffix]
//     if (typeof config === 'undefined') {
//         throw new Error(`No config found for Stage: ${stage} Suffix: ${suffix}`)
//     }
//     return config
// }

// module.exports = async function (hre: HardhatRuntimeEnvironment): Promise<boolean> {
//     // const { deployments, getNamedAccounts, ethers } = hre
//     const { deployments, getNamedAccounts } = hre
//     const { deploy } = deployments
//     const { verifier } = await getNamedAccounts()
//     const stage = networkToStage(hre.network.name)
//     const suffix = process.env.DVNSUFFIX

//     const config = getConfigForSuffix(stage, suffix)
//     const priceFeed = config.priceFeedAddress || (await deployments.get('PriceFeed')).address

//     console.log(`DVN deployer: ${verifier}`)
//     console.log(`PriceFeed address: ${priceFeed}`)
//     console.log(`Contract Deployment will be saved with filename: ${suffix ? `DVN${suffix}` : 'DVN'}`)

//     let signers = [...config.signers]

//     const admins = [...config.admins]
//     if (admins.length === 0) {
//         throw new Error(`No admins for stage ${stage}`)
//     }

//     const { quorum } = config
//     if (quorum < 1) {
//         throw new Error(`Quorum must be at least 1`)
//     }

//     const messageLibs: string[] = []
//     let sendUln301Addres: string | undefined

//     try {
//         const sendUln301: Deployment = await deployments.get('SendUln301')
//         sendUln301Addres = sendUln301.address
//         messageLibs.push(sendUln301Addres)
//         console.log(`DVN(${hre.network.name}) add SendUln301(${sendUln301Addres}) to MessageLibs`)
//     } catch (e) {
//         /// ignore
//     }

//     try {
//         const sendUln302: Deployment = await deployments.get('SendUln302')
//         messageLibs.push(sendUln302.address)
//         console.log(`DVN(${hre.network.name}) add SendUln302(${sendUln302.address}) to MessageLibs`)
//     } catch (e) {
//         /// ignore
//     }

//     // ulnV2
//     // TODO: edit this ultralightnodev2address function to return the V1 uln contract address!
//     let ulnV2: string = getUltraLightNodeV2Address(hre)
//     if (typeof ulnV2 === 'undefined') {
//         console.log(`UltraLightNodeV2 not deployed, try UltraLightNodeV2AltToken`)
//         ulnV2 = getUltraLightNodeV2AltTokenAddress(hre)
//     }
//     if (ulnV2) {
//         console.log(`DVN(${hre.network.name}) add UltraLightNodeV2(${ulnV2}) to MessageLibs`)
//         messageLibs.push(ulnV2)
//     } else {
//         console.log(`UltraLightNodeV2 and UltraLightNodeV2AltToken both not deployed, skip`)
//     }
//     console.log(`DVN(${hre.network.name}) MESSAGE_LIBS: ${messageLibs}`)

//     if (messageLibs.length === 0) throw new Error(`No messageLibs for stage ${stage}`)

//     // ======== for local test ========
//     // for local test, add verifierAdmin and verifierSigner1, verifierSigner2
//     if (networkToEnv(hre.network.name, EndpointVersion.V2) === Environment.LOCAL) {
//         const { verifierAdmin, verifierSigner1, verifierSigner2 } = await getNamedAccounts()
//         if (typeof verifierAdmin === 'undefined') throw new Error(`verifierAdmin not set in config/keys.yaml`)
//         if (typeof verifierSigner1 === 'undefined') throw new Error(`verifierSigner1 not set in config/keys.yaml`)
//         if (typeof verifierSigner2 === 'undefined') throw new Error(`verifierSigner2 not set in config/keys.yaml`)
//         if (!admins.includes(verifierAdmin)) admins.push(verifierAdmin)
//         if (!signers.includes(verifierSigner1)) signers.push(verifierSigner1)
//         if (!signers.includes(verifierSigner2)) signers.push(verifierSigner2)
//     }
//     signers = signers.sort((a, b) => a.localeCompare(b))
//     // ======== for local test ========

//     let name = 'DVN'
//     if (suffix !== undefined) {
//         name = `${name}${suffix}`
//     }

//     const vid = 10106

//     const args = [vid, messageLibs, priceFeed, signers, quorum, admins]
//     console.log(
//         'vid, messageLibs, priceFeed, signers, quorom, admins',
//         vid,
//         messageLibs,
//         priceFeed,
//         signers,
//         quorum,
//         admins
//     )
//     await deploy(name, {
//         contract: 'DVN',
//         from: verifier,
//         args,
//         // if set it to true, will not attempt to deploy
//         // even if the contract deployed under the same name is different
//         skipIfAlreadyDeployed: false,
//         log: true,
//         waitConfirmations: 1,
//         // gasPrice: '0',
//     })
//     return Promise.resolve(false)
// }

// module.exports.tags = ['DVN', 'test']
