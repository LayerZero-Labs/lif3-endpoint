import * as process from 'process'

import { bootstrap } from '../../src'

bootstrap(process.argv, []).catch((err) => {
    console.error(err)
    process.exit(1)
})
