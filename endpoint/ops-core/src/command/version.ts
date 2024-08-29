import fs from 'fs'

import * as commander from 'commander'
import { sync as findUpSync } from 'find-up'

export { command }

const command = new commander.Command().name('version')

command.description('Print version information').action(() => {
    const packagePath = findUpSync('package.json', { cwd: __dirname })
    if (!packagePath) {
        throw new Error('package.json not found')
    }
    const js = fs.readFileSync(packagePath, 'utf8')
    const { version } = JSON.parse(js)
    console.log(`BelowZero OPS Version: ${version}`)
})
