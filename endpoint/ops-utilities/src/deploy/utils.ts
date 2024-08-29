import * as fs from 'fs'
import * as path from 'path'

import axios from 'axios'
import { globSync } from 'glob'

import {
    Chain,
    EndpointVersion,
    Environment,
    Network,
    Stage,
    chainAndStageToNetwork,
} from '@layerzerolabs/lz-definitions'
import { extractUrlInfo, pkgroot } from '@layerzerolabs/lz-utilities'
import { Deployment, DeploymentFetcher, getLogger } from '@layerzerolabs/ops-core'

const logger = getLogger()

export type CompatibleVersionsType = { [version in 'default']: EndpointVersion[] } & {
    [version in EndpointVersion]?: string[]
}

export type SDKPackageName = '@layerzerolabs/lz-evm-sdk-v1' | '@layerzerolabs/lz-evm-sdk-v2'

export class LayerZeroSDKDeploymentFetcher implements DeploymentFetcher {
    private readonly defaultCompatibleVersions: CompatibleVersionsType
    resolvePackage: (packageName: SDKPackageName) => string

    constructor(resolvePackage: (packageName: SDKPackageName) => string) {
        this.resolvePackage = resolvePackage
        this.defaultCompatibleVersions = { default: [EndpointVersion.V2] }
    }

    async getDeployments(networks: Network[]): Promise<Deployment[]> {
        // this require third party must have dependencies in package.json
        const packages: SDKPackageName[] = ['@layerzerolabs/lz-evm-sdk-v1', '@layerzerolabs/lz-evm-sdk-v2']
        const deployments: Deployment[] = []

        for (const packageName of packages) {
            const packagePath = path.dirname(this.resolvePackage(packageName))
            const packageJSON = JSON.parse(fs.readFileSync(path.join(packagePath, 'package.json'), 'utf-8'))
            let compatibleVersions = this.defaultCompatibleVersions
            if (packageJSON.lzVersions) {
                compatibleVersions = packageJSON.lzVersions as CompatibleVersionsType
            }
            for (const network of networks) {
                const deployFiles = globSync(path.join(packagePath, 'deployments', network, '*.json'))
                for (const deployFile of deployFiles) {
                    const { address, abi, bytecode } = JSON.parse(fs.readFileSync(deployFile, 'utf-8'))
                    const name = path.basename(deployFile).replace('.json', '')

                    deployments.push({
                        name: path.basename(deployFile).replace('.json', ''),
                        address,
                        abi,
                        bytecode,
                        source: packageName,
                        network,
                        compatibleVersions: extractContractCompatibleVersions(name, compatibleVersions),
                    })
                }
            }
        }
        return Promise.resolve(deployments)
    }
}

export function extractContractCompatibleVersions(
    contract: string,
    versions: CompatibleVersionsType
): EndpointVersion[] {
    let contractVersions: EndpointVersion[] = []
    if (versions.v1?.includes(contract)) {
        contractVersions.push(EndpointVersion.V1)
    }
    if (versions.v2?.includes(contract)) {
        contractVersions.push(EndpointVersion.V2)
    }
    if (contractVersions.length === 0) {
        logger.debug(`No compatible versions found for ${contract} using default: ${versions.default}`)
        contractVersions = versions.default
    }
    return contractVersions
}

/**
 * The snapshot directory should be structured as follows:
 *     /www/data/
 *         ├── lz-evm-sdk-v1/
 *         │   └── xxx.json
 *         ├── lz-evm-sdk-v2/
 *         │   └── xxx.json
 *         ├── counter-v1-evm-contracts/
 *         │   └── xxx.json
 *         └── counter-v2-evm-contracts/
 *             └── xxx.json
 * */
export class SnapshotDeploymentsFetcher implements DeploymentFetcher {
    private readonly url: string | undefined

    constructor(url?: string) {
        this.url = url
    }

    async iterateDirectory(url: string, path: string): Promise<string[]> {
        const response = await axios.get(`${url}/${path}`)
        const files = []
        if (response.status == 200 && response.data) {
            const { data } = response
            const regex = /<a href=".*">(.*?)<\/a>/g
            const hrefs = data.matchAll(regex)
            for (const href of hrefs) {
                const filename = href[1]
                if (filename === '../') {
                    continue
                } else if (filename.endsWith('/')) {
                    files.push(...(await this.iterateDirectory(url, path + filename)))
                } else {
                    files.push(path + filename)
                }
            }
            return files
        }
        return []
    }

    async getDeployment(url: string, path: string): Promise<Deployment> {
        const response = await axios.get(`${url}/${path}`).catch((err) => {
            throw new Error(`Failed to get file ${url}/${path}. Error: ${err}`)
        })
        if (response.status == 200 && response.data) {
            const { data } = response
            if (data.name && data.source && data.abi && data.bytecode && data.network && data.address) {
                return data as Deployment
            } else {
                throw new Error(`Invalid deployment file. path: ${path}`)
            }
        } else {
            throw new Error(`Failed to get file ${path}. Http Status: ${response.status}. Data: ${response.data}`)
        }
    }

    /**
     * @param url the url of the chain endpoint. e.g. http://localhost:8545.
     *  Its primary purpose is to extract the host and port information from this URL.
     *  If the parameter "webDAVPort" is not defined or set,
     *  the function will automatically append the prefix "1" to the port number extracted from the URL.
     *  @param webDAVPort the port number of the webDAV server.
     * */
    async getDeployments(_networks: Network[], url?: string, webDAVPort?: string): Promise<Deployment[]> {
        if (!url && !this.url) {
            throw new Error(`URL is not set`)
        }
        const url_ = url || this.url
        if (url_ === undefined) {
            throw new Error(`URL is not set`)
        }
        const { schema, host, port } = extractUrlInfo(url_)
        if (!webDAVPort) {
            // append prefix "1" to the port number
            webDAVPort = '1' + port
        }
        const webDAV = `${schema}://${host}:${webDAVPort}`

        const files = await this.iterateDirectory(webDAV, 'webdav/')
        return Promise.all(
            files.map(async (file) => {
                return this.getDeployment(webDAV, file)
            })
        )
    }
}

export class CommonDeploymentFetcher implements DeploymentFetcher {
    private readonly defaultCompatibleVersions: CompatibleVersionsType

    constructor(
        private workspace: string,
        private lookUpTable = {}
    ) {
        this.defaultCompatibleVersions = { default: [EndpointVersion.V2] }
    }

    /**
     * Find the deployments in the SDK directory for a package
     * it will collect outcomes and store deployments and artifacts in the SDK directory during hardhat-deploy
     * @param packageName
     * @returns
     */
    toSource(packageName: string): string {
        return packageName in this.lookUpTable
            ? this.lookUpTable[packageName as keyof typeof this.lookUpTable]
            : packageName
    }

    async getDeployments(networks: Network[]): Promise<Deployment[]> {
        const deployments: Deployment[] = []
        const packageJSON = JSON.parse(fs.readFileSync(path.join(this.workspace, 'package.json'), 'utf-8'))
        const packageName = packageJSON.name
        let compatibleVersions = this.defaultCompatibleVersions
        if (packageJSON.lzVersions) {
            compatibleVersions = packageJSON.lzVersions as CompatibleVersionsType
        }
        for (const network of networks) {
            const deployFiles = globSync(path.join(this.workspace, 'deployments', network, '*.json'))
            for (const deployFile of deployFiles) {
                const { address, abi, bytecode } = JSON.parse(fs.readFileSync(deployFile, 'utf-8'))
                const name = path.basename(deployFile).replace('.json', '')
                deployments.push({
                    name,
                    address,
                    abi,
                    bytecode,
                    source: this.toSource(packageName),
                    network,
                    compatibleVersions: extractContractCompatibleVersions(name, compatibleVersions),
                })
            }
        }
        return Promise.resolve(deployments)
    }
}

/**
 * clear the deployment files in the specified directory of a package.
 * The directory structure should be as follows:
 *
 * */
export function clearDeploymentFiles(
    chains: Chain[],
    stage: Stage,
    environment: Environment = Environment.LOCAL,
    packages: string[] = [],
    relativeToPath: string
): void {
    const networks = chains.map((chain: Chain) => chainAndStageToNetwork(chain, stage, environment))
    // const pkgPaths = [
    //     '@layerzerolabs/counter-v1-evm-contracts',
    //     '@layerzerolabs/counter-v2-evm-contracts',
    //     '@layerzerolabs/lz-evm-messagelib-v2',
    //     '@layerzerolabs/lz-evm-protocol-v2',
    //     '@layerzerolabs/lz-evm-v1-0.7',
    // ]

    const deploymentPaths = packages
        .map((packageName) =>
            networks.map((network) => path.join(pkgroot(packageName, relativeToPath), 'deployments', network))
        )
        .flat()
    for (const path of deploymentPaths) {
        console.log(`Clearing ${path}`)
        if (fs.existsSync(path)) {
            fs.rmSync(path, { recursive: true })
        }
    }
}
