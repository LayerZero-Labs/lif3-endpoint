import { confirm, select } from '@inquirer/prompts'

export async function promptConfirm(msg: string): Promise<boolean> {
    return confirm({ message: msg, default: false })
}

export async function promptSelect(message: string, choices: string[]): Promise<number> {
    return select({
        message,
        choices: choices.map((choice, index) => ({ name: choice, value: index })),
    })
}
