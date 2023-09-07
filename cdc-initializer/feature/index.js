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
await feature.execute(phase, sites, featureName, environment)
