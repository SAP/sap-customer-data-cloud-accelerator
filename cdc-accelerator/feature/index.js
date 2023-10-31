/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import CLI from './cli.js'

const cli = new CLI()
const credentials = {
    userKey: process.env.USER_KEY,
    secret: process.env.SECRET_KEY,
}
await cli.main(credentials, process.argv)
