/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import CLI from './cli.js'
import fs from 'fs'
const cli = new CLI()
const credentials = {
    userKey: process.env.USER_KEY,
    secret: process.env.SECRET_KEY,
}
fs.realpath(process.argv[1], { encoding: 'utf8' }, async (error, resolvedPath) => {
    if (error) {
        console.log(error)
    } else {
        console.log('The resolved path is:', process.argv)
        await cli.main(credentials, process.argv)
    }
})
