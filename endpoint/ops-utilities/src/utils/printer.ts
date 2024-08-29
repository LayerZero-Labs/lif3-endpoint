let prev = 0

export function print(result: {
    [network: string]: { current: string; past: string; request: string; err: string }
}): void {
    if (prev && typeof process.stdout.moveCursor === 'function') {
        process.stdout.moveCursor(0, -prev)
    }
    if (Object.keys(result)) {
        prev = Object.keys(result).length + 4
        console.table(Object.keys(result).map((network) => ({ network, ...result[network] })))
    }
}

export function printEmptyLine(): void {
    prev = 0
    console.log('')
}
