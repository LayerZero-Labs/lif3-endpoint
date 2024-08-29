import { InvalidArgumentError, createArgument, createOption } from '@commander-js/extra-typings'

import { Chain, EndpointVersion, Environment, Stage } from '@layerzerolabs/lz-definitions'
const chainChoices = [...Object.values(Chain)]
export const OPTION_NO_PROMPT = createOption('-np, --noPrompt', 'no prompt').default(false)
export const OPTION_CONFIRMS = createOption(
    '-cf, --confirms <confirms>',
    'block number to wait for transaction to be finalized'
).default(0)
export const OPTION_SHOW_CALLDATA = createOption('-sc, --show-calldata', 'show calldata').default(false)
export const OPTION_SKIP_FROM_CHAINS = createOption(
    '-sf, --skip-from-chains <skip-from-chains...>',
    'csv of chains to skip'
)
    .choices(chainChoices)
    .default([])

export const OPTION_CHAINS = createOption('-c, --chains <chains>', 'comma separated value of chains').argParser(
    (value: string, _previous: string[]) => {
        return value
            .split(',')
            .map((x) => x.trim())
            .map((s) => {
                if (!chainChoices.includes(s as Chain)) {
                    throw new InvalidArgumentError(`Allowed choices are ${chainChoices.join(', ')}.`)
                }
                return s as Chain
            })
    }
)

export const OPTION_CHAINS_WITH_VERSION = createOption(
    '-c, --chains <chains...>',
    'comma separated value of chains'
).argParser((value: string, _previous: string[][]) => {
    const choices = Object.values(EndpointVersion)
        .map((version) => chainChoices.map((chain) => `${chain}:${version}`))
        .flat()

    return value
        .split(',')
        .map((x) => x.trim())
        .map((s) => {
            if (!choices.includes(s as Chain)) {
                throw new InvalidArgumentError(`Allowed choices are ${choices.join(', ')}.`)
            }
            return s.split(':')
        })
})

export const OPTION_FROM_CHAINS = createOption(
    '-f, --from-chains <from-chains...>',
    'comma separated value of chains'
).choices(chainChoices)

export const OPTION_TO_CHAINS = createOption(
    '-t, --to-chains <to-chains...>',
    'comma separated value of chains'
).choices(chainChoices)

export const OPTION_STAGE = createOption('-s, --stage <stage>', 'stage used for determining the deployment')
    .makeOptionMandatory(true)
    .choices(Object.values(Stage))

export const OPTION_ENV = createOption('-e, --env <env>', 'environment used for selecting chains')
    .makeOptionMandatory(true)
    .choices(Object.values(Environment))

export const OPTION_TO_VERSION = createOption('-tv, --to-version <to-version>', 'to endpoint version')
    .choices(Object.values(EndpointVersion))
    .makeOptionMandatory(true)
    .default(EndpointVersion.V1)

export const OPTION_FROM_VERSION = createOption('-fv, --from-version <from-version>', 'from endpoint version')
    .choices(Object.values(EndpointVersion))
    .makeOptionMandatory(true)
    .default(EndpointVersion.V1)

export const OPTION_OVERWRITE = createOption('--overwrite', 'overwrite deployment files?').default(false)

export const OPTION_TAGS = createOption(
    `--tags <tags>`,
    'bundle tags, separated by comma. the format is: `tag:tag,...`'
)
    .argParser((filterOpt: string | undefined) => {
        if (filterOpt === '' || filterOpt === undefined) {
            return []
        }
        const filterGroups = filterOpt.split(',').map((filter) => {
            const tags = filter.split(':')
            return tags
        })
        return filterGroups
    })
    .default([] as string[][])

export const ARG_BUNDLES = createArgument('[bundles]', 'bundle names, separated by commas.').argParser(
    (value: string, _previous: string[]): string[] => {
        return (
            value
                .split(',')
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                .filter((x) => x !== undefined)
                .map((x) => x.trim())
                .filter((x) => x !== '')
        )
    }
)

export const OPTION_DRYRUN = createOption('--dry-run', 'only report what it would have done').default(false)

export const OPTION_SKIP_FUNCTIONS = createOption('--skip-functions <from-version>', 'skip functions')
    .default([] as string[])
    .argParser(function commaSeparatedList(value: string, _prev: string[]): string[] {
        return value.split(',')
    })
