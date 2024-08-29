import crypto from 'crypto'

import { OpsBundleUserConfig } from '../types/config'

export function getIdent(obj: object): string {
    const hash = crypto.createHash('md5')
    hash.update(JSON.stringify(obj))
    return hash.digest('hex')
}

export function getBundleIdent(obj: OpsBundleUserConfig): string {
    return getIdent({
        name: obj.name,
        tags: obj.tags,
        path: obj.path,
        chains: obj.chains,
        chainTypes: obj.chainTypes,
    })
}
