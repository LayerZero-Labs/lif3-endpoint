import fs from 'fs'
import path from 'path'
import process from 'process'

import { StopSymbol, sync as _findUpSync, Match as findUpMatch, stop as findUpStop } from 'find-up'

function parentPathOf(current: string, limit: number): string {
    return path.join(current, ...Array.from({ length: limit }, () => '..'))
}

export interface MatcherOptions {
    stopAt?: string
    limit?: number
    cwd?: string
}

export function makeMatcher(candidates: string[], options: MatcherOptions): (directory: string) => findUpMatch {
    const cwd = options.cwd ?? process.cwd()
    const stopAt = options.stopAt ?? (options.limit ? parentPathOf(cwd, options.limit) : undefined)
    const matcher = (directory: string): string | StopSymbol | undefined => {
        for (const candidate of candidates) {
            const filename = path.resolve(directory, candidate)
            try {
                const stats = fs.statSync(filename)
                return filename
            } catch (error) {
                // ignore
            }
        }

        if (stopAt && directory === stopAt) {
            return findUpStop
        }

        return undefined
    }
    return matcher
}

export function findUpSync(candidates: string[], options?: MatcherOptions): string {
    const opts: MatcherOptions = { ...{ cwd: process.cwd(), ...(options ?? {}) } }
    const foundPath = _findUpSync(makeMatcher(candidates, opts), {
        cwd: opts.cwd,
    })
    if (foundPath === undefined) {
        throw new Error(`Cannot find config file in ${opts.cwd} or its parent directories`)
    }

    return foundPath
}
