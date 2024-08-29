import path from 'node:path'

import { describe, expect, test } from '@jest/globals'

import { Chain } from '@layerzerolabs/lz-definitions'

import { loadExtenders } from '../cli'
import { OpsConfig } from '../types/config'

import {
    TS_CONFIG_FILE_NAME,
    buildContext,
    buildEnvironment,
    filterBundles,
    findConfigPath,
    getBundlesForChain,
    parseConfig,
} from './context'
import { MatcherOptions } from './findup'

const root = path.join(__dirname, '../../')

// code below will disable 'ts-node', or it will transpile test.ts file
jest.mock('ts-node', () => {
    return {
        __esModule: false,
        register: jest.fn(),
    }
})

describe('from fixture-projects/counter', () => {
    const wd = path.join(root, 'fixture-projects/counter')
    type FindConfigPathCase = [
        // from
        string[],
        // options
        { stopAt?: string[]; limit?: number },
        // willThrow
        boolean,
        // expected
        string[],
    ]

    test.each([
        [[root], undefined, true, undefined],
        [[wd], undefined, false, [wd, TS_CONFIG_FILE_NAME]],
        [[wd, 'v2/evm/ops'], undefined, false, [wd, 'v2', TS_CONFIG_FILE_NAME]],
        [[wd, 'v2/evm/ops'], { limit: 1 }, true, undefined],
        [[wd, 'v2/evm/ops'], { stopAt: [wd, 'v2/evm/ops'] }, true, undefined],
        [[wd, 'v2/evm/ops'], { limit: 3 }, false, [wd, 'v2', TS_CONFIG_FILE_NAME]],
        [[wd, 'v2/evm/ops'], { stopAt: [wd] }, false, [wd, 'v2', TS_CONFIG_FILE_NAME]],
    ] as FindConfigPathCase[])(
        'findConfigPath %#',
        (from, options: { stopAt?: string[]; limit?: number } | undefined, willThrow, expected) => {
            const opts: MatcherOptions = {
                stopAt: options?.stopAt !== undefined ? path.join(...options.stopAt) : undefined,
                limit: options?.limit,
                cwd: path.join(...from),
            }

            if (willThrow) {
                expect(() => findConfigPath(opts)).toThrow()
            } else {
                const configPath = findConfigPath(opts)
                expect(configPath).toEqual(path.join(...(expected ?? [])))
            }
        }
    )

    describe('parseConfig', () => {
        const opts: MatcherOptions = {
            cwd: path.join(wd),
        }

        const configPath = findConfigPath(opts)
        expect(configPath).toBe(path.join(wd, TS_CONFIG_FILE_NAME))
        const userConfig = parseConfig(configPath)
        const config: OpsConfig = { bundles: [] }
        const extenders = loadExtenders(userConfig, [])
        const configProcessors = extenders.map((extender) => extender.processConfig)
        const context = buildContext(configProcessors)
        const env = buildEnvironment(context, userConfig, config)
        test('env.config.bundles', () => {
            expect(env.config.bundles.length).toBe(6)
        })

        test('getBundlesForChain By Chain Ethereum', () => {
            const projects = getBundlesForChain(env.config.bundles ?? [], Chain.ETHEREUM)
            expect(projects.length).toBe(3)
        })

        test('getBundlesForChain By Chain ZkSync', () => {
            const projects = getBundlesForChain(env.config.bundles ?? [], Chain.ZKSYNC)
            expect(projects.length).toBe(2)
        })

        test('filterBundles By Chain Ethereum', () => {
            const projects = filterBundles(env.config.bundles ?? [], ['counter'], [], [Chain.ETHEREUM])
            expect(projects.length).toBe(3)
        })

        test('filterBundles By Chain ZkSync', () => {
            const projects = filterBundles(env.config.bundles ?? [], ['counter'], [], [Chain.ZKSYNC])
            expect(projects.length).toBe(2)
        })

        test('filterBundles By Filter and Chain Ethereum', () => {
            const projects = filterBundles(env.config.bundles ?? [], ['counter'], [['v1']], [Chain.ETHEREUM])
            expect(projects.length).toBe(2)
        })

        test('filterBundles By Filter and ChainType EVM', () => {
            const projects = filterBundles(env.config.bundles ?? [], ['counter'], [['v1']], [])
            expect(projects.length).toBe(3)
        })

        test('filterBundles By Filter and Chain ZkSync', () => {
            const projects = filterBundles(env.config.bundles ?? [], ['counter'], [['v2']], [Chain.ZKSYNC])
            expect(projects.length).toBe(1)
        })

        test('filterBundles By Multiple tags', () => {
            const projects = filterBundles(env.config.bundles ?? [], ['counter'], [['official', 'example']], [])
            expect(projects.length).toBe(2)
        })

        test('filterBundles By Filter and Chain', () => {
            const projects = filterBundles(env.config.bundles ?? [], ['counter'], [], [])
            expect(
                [`${wd}/v1/evm`, `${wd}/v2/evm`].every((path) => projects.find((x) => x.path === path) !== undefined)
            ).toBe(true)
        })
    })
})
