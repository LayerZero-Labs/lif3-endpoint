import path from 'path'
import process from 'process'

import { buildCommandFamily } from './command'
import { OpsConfig, OpsExtenderConfig, OpsUserConfig } from './types/config'
import { buildContext, buildEnvironment, findConfigPath, parseConfig } from './utils'

export function loadExtenders(userConfig: OpsUserConfig, predefinedExtenders: string[]): OpsExtenderConfig[] {
    const candidates = [...predefinedExtenders, ...(userConfig.extenders ?? [])]

    return candidates.map((candidate) => {
        const packagePath = path.isAbsolute(candidate) ? candidate : require.resolve(candidate)
        const meta = require(`${packagePath}/package.json`)
        const extenderDefinition = require(path.join(packagePath, meta.main))
        return extenderDefinition.default ?? extenderDefinition
    })
}

/**
 * Bootstrap ops
 * @param argv
 * @param predefinedExtenders   ops-plugin-core is loaded as default
 */
export async function bootstrap(argv: string[] = process.argv, predefinedExtenders: string[] = []): Promise<void> {
    const configPath = findConfigPath({ cwd: process.cwd() })
    // 1. load config of all workspaces
    const userConfig = parseConfig(configPath)
    const config: OpsConfig = { bundles: [] }
    // 2. load extenders from configs and predefined extenders
    const extenders = loadExtenders(userConfig, predefinedExtenders)
    const configProcessors = extenders.map((extender) => extender.processConfig)
    // 3. build context by processors defined in extenders
    const context = buildContext(configProcessors)
    // 4. process processors(userConfig -> config) and build environment
    const env = buildEnvironment(context, userConfig, config)
    // 5. build command family based on OpsEnvironment
    const commandBuilders = extenders.map((extender) => extender.buildCommandFamily)
    const program = await buildCommandFamily(env, commandBuilders)
    await program.parseAsync(argv)
}
