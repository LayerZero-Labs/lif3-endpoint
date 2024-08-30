import * as fs from 'fs'

import { HardhatRuntimeEnvironment } from 'hardhat/types'

export function getPriceFeedV2Address(hre: HardhatRuntimeEnvironment): string {
    if (hre.network.name === 'hardhat') {
        return hre.ethers.constants.AddressZero
    }
    const priceFeed = JSON.parse(
        fs
            .readFileSync(
                `${__dirname}/../../../../layerzero-v2/evm/sdk/deployments/${hre.network.name}/PriceFeed.json`,
                'utf-8'
            )
            .toString()
    )
    return priceFeed.address
}
