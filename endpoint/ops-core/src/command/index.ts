import * as commander from 'commander'

import { OpsCommandFamilyBuilder } from '../types/config'
import { OpsEnvironment } from '../types/runtime'

import { command as versionCommand } from './version'

const defaultCommandFamilyBuilder = (_env: OpsEnvironment): commander.Command[] => {
    return [versionCommand]
}

export async function buildCommandFamily(
    env: OpsEnvironment,
    commandBuilders: OpsCommandFamilyBuilder[]
): Promise<commander.Command> {
    const rootCommand = new commander.Command()
    rootCommand.name('ops').description('An extensible tool for Web3 development')
    // push defaultCommands to the beginning
    commandBuilders.unshift(defaultCommandFamilyBuilder)
    commandBuilders.forEach((builder) => {
        const commands = builder(env)
        for (const command of commands) {
            rootCommand.addCommand(command)
        }
    })

    return rootCommand
}
