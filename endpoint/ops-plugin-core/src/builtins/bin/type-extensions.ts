import { Executable } from '@layerzerolabs/ops-core'

declare module '@layerzerolabs/ops-core' {
    export interface ExecutableOption {
        cwd?: string
        env?: { [key in string]: string }
        shell?: boolean | string
        [key: string]: any
    }

    export interface OpsBundleUserConfig {
        bin?: {
            command?: string
            executer?: Executable
            options?: ExecutableOption
        }
    }

    export interface OpsBundleConfig {
        bin?: {
            executer: Executable
            options: ExecutableOption
        }
    }
}

declare module '@layerzerolabs/ops-core' {
    export interface Executable {
        execute(argv: string[]): Promise<number | null>
    }
}
