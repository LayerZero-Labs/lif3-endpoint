export function calculateGasLimit(baseGasLimit: string, multiplier: number): string {
    return (BigInt(baseGasLimit) * BigInt(multiplier)).toString()
}
