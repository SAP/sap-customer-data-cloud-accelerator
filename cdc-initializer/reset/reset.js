/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import 'dotenv/config'
import readline from 'readline'

import { CONFIG_FILENAME } from '../constants.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const config = require(`../../${CONFIG_FILENAME}`)

import Gigya from '../services/gigya/gigya.js'
import { parseArguments } from '../utils/utils.js'
import { init } from '../init/init.js'

const { USER_KEY, SECRET_KEY } = process.env
const gigya = new Gigya(USER_KEY, SECRET_KEY)

const reset = async (props) => {
    // Get confirmation from user to replace existing directories
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    return await rl.question(`This will overwrite all files in your src/ directory, are you sure you want to continue? (Y/n)\n`, async (response) => {
        rl.close()
        if (response.toUpperCase() === 'Y') {
            await init({ ...props, reset: true })
        }
    })
}

const { sites, featureName, environment } = parseArguments({ args: process.argv, config: config.source })
reset({ gigya, sites, featureName, environment })
