import { Wallet } from '@coral-xyz/anchor'
import { Connection, Keypair } from '@solana/web3.js'
import Squads from '@sqds/sdk'

export function getSquads(connection: Connection, keypair: Keypair): Squads {
    return new Squads({
        connection: connection,
        wallet: new Wallet(keypair),
    })
}
