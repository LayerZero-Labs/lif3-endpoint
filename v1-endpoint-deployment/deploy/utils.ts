import * as fs from 'fs'

import { ethers } from 'ethers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

export function getPriceFeedV2Address(hre: HardhatRuntimeEnvironment): string {
    // Read the endpoint-config.json file
    const endpointConfig = JSON.parse(fs.readFileSync('./endpoint-config.json', 'utf-8'))

    // Get the networkName from endpoint-config.json
    const networkName = endpointConfig[hre.network.name]?.name || hre.network.name

    if (hre.network.name === 'hardhat') {
        return ethers.constants.AddressZero
    }

    try {
        const priceFeed = JSON.parse(fs.readFileSync(`./deployments/${networkName}/PriceFeed.json`, 'utf-8').toString())
        return priceFeed.address
    } catch (error) {
        console.error(`Error reading PriceFeed.json for network ${networkName}:`, error)
        return ethers.constants.AddressZero
    }
}
