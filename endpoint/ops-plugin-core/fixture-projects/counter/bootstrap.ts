import * as path from 'path'
import * as process from 'process'

import { bootstrap } from '@layerzerolabs/ops-core'

bootstrap(process.argv, [path.dirname(require.resolve('@layerzerolabs/ops-plugin-core/package.json'))]).catch((err) => {
    console.error(err)
    process.exit(1)
})
