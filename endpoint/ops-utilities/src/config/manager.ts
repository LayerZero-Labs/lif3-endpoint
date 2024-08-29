import { Stage } from '@layerzerolabs/lz-definitions'

import { ConfigureManager } from './types'

type ConfigQueryElementType = string | number | (string | number)[]

export class LayerZeroConfigManager implements ConfigureManager {
    constructor(protected config: { [key in Stage]: any }) {}

    get(...params: ConfigQueryElementType[]): any {
        let cur = this.config
        for (const p of params) {
            if (cur === undefined) {
                throw new Error(`Couldn't find ${p} in undefined, params: ${params}`)
            }

            if (typeof p === typeof []) {
                cur = ((obj: { [key: string | number]: any }, items: (string | number)[]) => {
                    for (const x of items) {
                        if (x in obj) {
                            return obj[x]
                        }
                    }
                })(cur as object, p as (string | number)[])
            } else {
                cur = (cur as { [key: string | number]: any })[p as string | number]
            }
        }
        return cur
    }
}
