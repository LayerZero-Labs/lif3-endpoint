import _ from 'lodash'

import { GnosisSigner } from './gnosis'
import { SquadsSigner } from './squads'
import { CombinedGnosisItemConfig, GnosisConfig, GnosisItemConfig, SignerConfig, SquadsItemConfig } from './types'

export function combineKeysAndGnosisConfig(keyConfigs: SignerConfig, gnosisConfigs: GnosisConfig): SignerConfig {
    return _.merge(keyConfigs, gnosisConfigs)
}

export function isGnosisSigner(obj: any): obj is GnosisSigner {
    if (obj === undefined || obj === null) {
        return false
    }

    return 'safeConfig' in obj
}

export function isGnosisItemConfig(obj: any): obj is GnosisItemConfig {
    if (obj === undefined || obj === null) {
        return false
    }

    return 'safeUrl' in obj && 'safeAddress' in obj
}

export function isSquadsSigner(obj: any): obj is SquadsSigner {
    if (obj === undefined || obj === null) {
        return false
    }

    return 'squadsConfig' in obj
}

export function isSquadsItemConfig(obj: any): obj is SquadsItemConfig {
    if (obj === undefined || obj === null) {
        return false
    }

    return 'multisigAddress' in obj
}

export function isCombinedGnosisItemConfig(obj: any): obj is CombinedGnosisItemConfig {
    if (obj === undefined || obj === null) {
        return false
    }

    return 'safeUrl' in obj && 'safeAddress' in obj && ('mnemonic' in obj || 'pk' in obj)
}
