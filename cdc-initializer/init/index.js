/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
require('dotenv').config()

const { CONFIG_FILENAME } = require('../constants')
const config = require(`../../${CONFIG_FILENAME}`)
const Gigya = require('../services/gigya/gigya')
const { parseArguments } = require('../utils/utils')
const { init } = require('./init')

const { USER_KEY, SECRET_KEY } = process.env
const gigya = new Gigya(USER_KEY, SECRET_KEY)

const { sites, featureName, environment } = parseArguments({ args: process.argv, config: config.source })
init({ gigya, sites, featureName, environment })
