/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import 'dotenv/config'

import { CONFIG_FILENAME } from '../constants.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const config = require(`../../${CONFIG_FILENAME}`)

import { parseArguments } from '../utils/utils.js'
import Feature from "./feature";

const { phase, sites, featureName, environment } = parseArguments({ args: process.argv, config: config.source })
const credentials = { userKey: process.env.USER_KEY, secret: process.env.SECRET_KEY }

const feature = new Feature(credentials)
switch(phase) {
    case 'init':
        await feature.init(sites, featureName, environment, false)
        break;
    case 'reset':
        await feature.reset(sites, featureName, environment)
        break;
    case 'build':
        await feature.build(sites, featureName, environment)
        break;
    default:
        console.log(`Unknown phase ${phase}`)
}
