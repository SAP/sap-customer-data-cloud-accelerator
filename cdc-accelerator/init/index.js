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

const { USER_KEY, SECRET_KEY } = process.env
const gigya = new Gigya(USER_KEY, SECRET_KEY)

if (process.argv.length >= 2) {
    const { sites, featureName, environment } = parseArguments({ args: process.argv, config: config.source })
    init({ gigya, sites, featureName, environment })
}
