/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
const readline = require('readline')

const { CONFIG_FILENAME } = require('../constants')
const config = require(`../../${CONFIG_FILENAME}`)
const Gigya = require('../services/gigya/gigya')
const { parseArguments } = require('../utils/utils')
const { init } = require('../init/init')

require('dotenv').config()
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
