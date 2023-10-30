/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import 'dotenv/config'

import { CONFIG_FILENAME } from '../constants.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const config = require(`../../${CONFIG_FILENAME}`)
import Gigya from '../services/gigya/gigya.js'
import { parseArguments } from '../utils/utils.js'
import { init } from './init.js'
import validator from 'validator'
const path = require('path')
const { USER_KEY, SECRET_KEY } = process.env
const gigya = new Gigya(USER_KEY, SECRET_KEY)
const [, , arg1, arg2, arg3, arg4] = process.argv
if (process.argv.length >= 2) {
    // Sanitize the arguments, removing potentially malicious input.
    const sanitizedArg1 = process.argv[1].replace(/[<>]/g, '') // Remove < and > characters

    if (!path.isAbsolute(sanitizedArg1)) {
        console.error('arg1 and arg2 should be absolute file paths.')
        process.exit(1)
    }
    console.log('aoskdjasd', process.argv)
    console.log('aoskdjasd', validator.escape(process.argv[1]))
    const { sites, featureName, environment } = parseArguments({ args: process.argv, config: config.source })
    init({ gigya, sites, featureName, environment })
}
