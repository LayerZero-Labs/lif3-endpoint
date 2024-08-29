import { OpsEnvironment, filterBundles, getLogger } from '@layerzerolabs/ops-core'

import { ARG_BUNDLES, OPTION_CHAINS, OPTION_ENV, OPTION_STAGE, OPTION_TAGS } from '../options'
import { CommandExt } from '../utils'

import { isExecutable } from './utils'

const logger = getLogger()

const command = new CommandExt()
    .name('run')
    .description('Execute commands')
    .addOption(OPTION_TAGS)
    .addOption(OPTION_STAGE)
    .addOption(OPTION_ENV)
    .addOption(OPTION_CHAINS)
    .allowUnknownOption(true)
    .addArgument(ARG_BUNDLES)
    .allowExcessArguments(true)
    .passThroughOptions(true)
    .action(commandAction)

async function commandAction(bundleNames: string[] | undefined): Promise<void> {
    // @ts-expect-error TS2339 We sure we have __CONTEXT__ in command options
    const context = command.opts().__CONTEXT__ as OpsEnvironment

    const { tags: opt_tags, chains: opt_chains } = command.opts()

    const args = command.args.slice(command.args.length)

    for (const chain of opt_chains ?? []) {
        // bundles meet filter criteria
        let bundles = filterBundles(context.config.bundles, bundleNames ?? [], opt_tags, [chain])

        // filter out bundles that without bin property
        bundles = bundles.filter((x) => x.bin !== undefined)

        logger.debug({ message: bundles, format: `bundles for ${chain}: %s`, pretty: true })

        for (const bundle of bundles) {
            const executer = bundle.bin?.executer
            if (executer === undefined) {
                continue
            }
            if (!isExecutable(executer)) {
                throw new Error(`the executer of ${bundle.name} is not a executable`)
            }
            await executer.execute(args)
        }
    }
}

export default command
