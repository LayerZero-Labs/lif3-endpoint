import { Logger, createLogger } from '@layerzerolabs/lz-utilities'

let logger: Logger

export function getLogger(): Logger {
    if (!logger) {
        logger = createLogger(process.env.OPS_LOG ?? 'info')
    }
    return logger
}

export { Logger }
