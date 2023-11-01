/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import CLI from './cli.js'
import xssFilters from 'xss-filters'
const cli = new CLI()
const credentials = {
    userKey: process.env.USER_KEY,
    secret: process.env.SECRET_KEY,
}
if (process.argv.length >= 3 && typeof process.argv[2] === 'string') {
    console.log(sanitizeError(process.argv))
    // const operations = {
    //     operation: process.argv[2],
    //     sites: process.argv[3],
    //     featureName: process.argv[4],
    //     environment: process.argv[5],
    // }
    await cli.main(credentials, sanitizeError(process.argv))
}

function sanitizeError(value) {
    return xssFilters.inHTMLData(value)
}
