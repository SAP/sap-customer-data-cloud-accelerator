/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import 'dotenv/config'

import Feature from './feature'
import CLI from './cli'

const cli = new CLI()
const { phase, sites, featureName, environment } = cli.parseArguments(process.argv)

const credentials = { userKey: process.env.USER_KEY, secret: process.env.SECRET_KEY }
const feature = new Feature(credentials)
switch (phase) {
    case 'init':
        await feature.init(sites, featureName, environment, false)
        break
    case 'reset':
        const resetConfirmed = await feature.reset(sites, featureName)
        if (resetConfirmed) {
            await feature.init(sites, featureName, environment)
        }
        break
    case 'build':
        await feature.build()
        break
    case 'deploy':
        await feature.deploy(sites, featureName, environment)
        break
    default:
        console.log(`Unknown phase ${phase}`)
}
