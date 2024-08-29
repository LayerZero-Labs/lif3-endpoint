import { Command } from '@commander-js/extra-typings'

/**
 * CommandExt will make sure there is at most one argument before the first option
 */
export class CommandExt extends Command {
    async _parseCommand(operands: string[], unknown: string[]): Promise<any> {
        // the args before the first option will be put in operands
        if (operands.length > 1) {
            throw new Error(
                `only at most one argument is allowed as the project names, it should immediately follow '${this.name()}' command.`
            )
        } else if (operands.length === 0) {
            // make sure that the first argument will not be assigned value from the arguments after options
            operands.push('')
        }

        // @ts-expect-error
        return super._parseCommand(operands, unknown)
    }
}
