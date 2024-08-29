import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { describe, expect, jest, test } from '@jest/globals'

import { MatcherOptions, findUpSync } from './findup'

class ErrnoError extends Error {
    constructor(
        public code: string,
        _message?: string
    ) {
        super()
    }
}

const TS_CONFIG_FILE_NAME = 'belowzero.config.ts'
const JS_CONFIG_FILE_NAME = 'belowzero.config.js'
const CJS_CONFIG_FILE_NAME = 'belowzero.config.cjs'
const CONFIG_FILE_NAMES = [TS_CONFIG_FILE_NAME, JS_CONFIG_FILE_NAME, CJS_CONFIG_FILE_NAME]

interface FileObject {
    isFile?: boolean
    isDirectory?: boolean
    data?: string
}
const mockFileSystem = Object.fromEntries(
    Object.entries({
        [`/${TS_CONFIG_FILE_NAME}`]: { isFile: true, data: '' },
        [`/v2/${JS_CONFIG_FILE_NAME}`]: { isFile: true, data: '' },
    } as FileObject).map(([key, value]) => {
        return [
            path.join(process.cwd(), 'fixture-projects/example', key),
            {
                isFile: () => value.isFile,
                isDirectory: () => value.isDirectory || !value.isFile,
                data: value.data,
            },
        ]
    })
)

jest.mock('fs', () => {
    const originalModule: any = jest.requireActual('fs')

    return {
        __esModule: false,
        ...originalModule,
        existsSync: jest.fn((path: string) => path in mockFileSystem),
        accessSync: jest.fn((path: string) => {
            if (!(path in mockFileSystem)) {
                throw new ErrnoError('ENOENT', 'mock: file not found')
            }
            return fs.constants.F_OK
        }),
        statSync: jest.fn((path: string) => {
            if (!(path in mockFileSystem)) {
                throw new ErrnoError('ENOENT', 'mock: file not found')
            }
            return mockFileSystem[path]
        }),
    }
})

describe('from fixture-projects/example', () => {
    const root = process.cwd()
    const wd = path.join(root, 'fixture-projects/example')
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
        [[wd, 'v2/evm/ops'], undefined, false, [wd, 'v2', JS_CONFIG_FILE_NAME]],
        [[wd, 'v2/evm/ops'], { limit: 1 }, true, undefined],
        [[wd, 'v2/evm/ops'], { stopAt: [wd, 'v2/evm/ops'] }, true, undefined],
        [[wd, 'v2/evm/ops'], { limit: 3 }, false, [wd, 'v2', JS_CONFIG_FILE_NAME]],
        [[wd, 'v2/evm/ops'], { stopAt: [wd] }, false, [wd, 'v2', JS_CONFIG_FILE_NAME]],
    ] as FindConfigPathCase[])(
        'findConfigPath %#',
        (from, options: { stopAt?: string[]; limit?: number } | undefined, willThrow, expected) => {
            const opts: MatcherOptions = {
                stopAt: options?.stopAt !== undefined ? path.join(...options.stopAt) : undefined,
                limit: options?.limit,
                cwd: path.join(...from),
            }
            if (willThrow) {
                expect(() => findUpSync(CONFIG_FILE_NAMES, opts)).toThrow()
            } else {
                expect(findUpSync(CONFIG_FILE_NAMES, opts)).toEqual(path.join(...(expected ?? [])))
            }
        }
    )
})
