import { OpsExtenderConfig } from '@layerzerolabs/ops-core'
import './builtins'

import {
    buildCommandFamily as configCommandBuilder,
    processConfig as configProcessConfig,
} from './builtins/config/utils'
import {
    buildCommandFamily as deployCommandBuilder,
    processConfig as deployProcessConfig,
} from './builtins/deploy/utils'

// TODO: removed binProcessConfig and binCommandBuilder temporarily
const BUILTIN_CONFIG_PROCESSORS = [deployProcessConfig, configProcessConfig]
const BUILTIN_COMMAND_BUILDERS = [deployCommandBuilder, configCommandBuilder]

const config: OpsExtenderConfig = {
    processConfig: (userConfig, config) => {
        for (const processor of BUILTIN_CONFIG_PROCESSORS) {
            processor(userConfig, config)
        }
    },
    buildCommandFamily: (env) => {
        return BUILTIN_COMMAND_BUILDERS.map((builder) => {
            return builder(env)
        }).flat()
    },
}

export * from './builtins'

export default config
