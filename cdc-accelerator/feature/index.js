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
    console.log(validateProcess())
    // const operations = {
    //     operation: process.argv[2],
    //     sites: process.argv[3],
    //     featureName: process.argv[4],
    //     environment: process.argv[5],
    // }
    await cli.main(credentials, validateProcess())
}
function validateProcess() {
    const allowedArgs = ['init', 'reset', 'deploy', 'build']

    for (let i = 2; i < process.argv.length; i++) {
        if (!allowedArgs.includes(process.argv[i])) {
            console.error(`Invalid argument: ${process.argv[i]}`)
            process.exit(1) // Exit the program with an error status code
        }
        return sanitizeError(process.argv.replace('\t', '-').replace('\n', '-').replace('\r', '-'))
    }
}

function sanitizeError(value) {
    return xssFilters.inHTMLData(value)
}
