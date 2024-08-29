import './type-extensions'

import childProcess from 'child_process'
import path from 'path'
import process from 'process'

import * as commander from 'commander'
import { $ } from 'zx'

import { Executable, OpsConfig, OpsEnvironment, OpsUserConfig, getBundleIdent } from '@layerzerolabs/ops-core'

import rootCommand from './command'

export function processConfig(userConfig: Readonly<OpsUserConfig>, config: OpsConfig): void {
    for (const bundleUserConfig of userConfig.bundles ?? []) {
        if (bundleUserConfig.bin === undefined) {
            continue
        }

        const executer = ((): Executable | undefined => {
            return bundleUserConfig.bin.command !== undefined
                ? new CommandExecutable(bundleUserConfig.bin.command, bundleUserConfig.bin.options)
                : bundleUserConfig.bin.executer
        })()

        if (!isExecutable(executer)) {
            throw new Error(`the executer of ${bundleUserConfig.name} is not executable`)
        }

        const ident = getBundleIdent(bundleUserConfig)
        const bundleConfig = config.bundles.find((p) => p.ident === ident)
        if (bundleConfig === undefined) {
            continue
        }

        bundleConfig.bin = {
            options: bundleUserConfig.bin.options ?? {},
            executer: executer,
        }
    }
}

interface CommandOptions {
    cwd?: string
    env?: { [key in string]: string }
    shell?: boolean | string
}
class CommandExecutable implements Executable {
    protected runningCommand: childProcess.ChildProcess | undefined = undefined

    constructor(
        private readonly command: string,
        private options: CommandOptions | undefined
    ) {}

    async execute(args: string[]): Promise<number | null> {
        return new Promise((resolve, reject) => {
            const executableFile = this.command
            const executableDir = path.dirname(executableFile)
            console.log('-->', args)
            console.log(this.options)

            const proc = $.spawn(executableFile, args, {
                cwd: this.options?.cwd,
                env: this.options?.env,
                shell: this.options?.shell,
                stdio: 'inherit',
            })

            if (!proc.killed) {
                // testing mainly to avoid leak warnings during unit tests with mocked spawn
                const signals = ['SIGUSR1', 'SIGUSR2', 'SIGTERM', 'SIGINT', 'SIGHUP'] as const
                signals.forEach((signal) => {
                    process.on(signal, () => {
                        if (!proc.killed && proc.exitCode === null) {
                            proc.kill(signal)
                        }
                    })
                })
            }

            proc.on('close', (code) => {
                resolve(code)
            })

            proc.on('error', (err) => {
                // @ts-expect-error
                if (err.code === 'ENOENT') {
                    const executableDirMessage = executableDir
                        ? `searched for local subcommand relative to directory '${executableDir}'`
                        : 'no directory for search for local subcommand, use .executableDir() to supply a custom directory'
                    const executableMissing = `'${executableFile}' does not exist`
                    reject(new Error(executableMissing))
                    // @ts-expect-error
                } else if (err.code === 'EACCES') {
                    reject(new Error(`'${executableFile}' not executable`))
                } else {
                    reject(err)
                }
            })
        })
    }
}

export function buildCommandFamily(env: OpsEnvironment): commander.Command[] {
    rootCommand.setOptionValue('__CONTEXT__', env)
    // @ts-expect-error TS2322 Command type doesn't matter here
    return [rootCommand]
}

export function isExecutable(obj: any): obj is Executable {
    if (obj === undefined || obj === null) {
        return false
    }

    return 'execute' in obj && typeof obj.execute === 'function'
}
