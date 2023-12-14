/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import CLI from '../cli.js'
import { getSiteFeature, credentials, config } from '../../feature/__tests__/test.common.js'
import Accelerator from '../accelerator.js'
import PartnerFeature from '../../feature/partnerFeature.js'
import { Operations } from '../constants.js'
import Configuration from '../configuration.js'

jest.mock('../accelerator.js')
jest.mock('../configuration.js')

describe('CLI test suite', () => {
    const processExecutable = 'cdc-accelerator/feature/index.js'
    const process = {
        argv: [
            'node',
            processExecutable,
            Operations.init, // operation
            'webSdk', // feature name
            'dev', // environment
        ],
        env: {
            USER_KEY: credentials.userKey,
            SECRET_KEY: credentials.secret,
        },
    }

    beforeAll(() => {
        Accelerator.mockImplementation(() => {
            return {
                execute: () => {
                    return true
                },
            }
        })
    })

    const cli = new CLI()

    beforeAll(() => {
        cli.siteFeature = getSiteFeature()
        cli.partnerFeature = new PartnerFeature(credentials)
    })

    afterAll(() => {
        jest.restoreAllMocks()
    })

    test.each([[true], [false]])(`main executed with configuration valid %s`, async (isValid) => {
        Configuration.isValid.mockImplementation(() => {
            return isValid
        })
        const result = await cli.main(process, process.argv[2], process.argv[3], process.argv[4])
        expect(result).toBe(isValid)
    })

    test.each([[{ USER_KEY: credentials.userKey, SECRET_KEY: credentials.secret }], [{ USER_KEY: '', SECRET_KEY: '' }]])(`main executed with credentials %s`, async (env) => {
        process.env = env
        Configuration.isValid.mockImplementation(() => {
            return true
        })
        const result = await cli.main(process, process.argv[2], process.argv[3], process.argv[4])
        expect(result).toBe(process.env.USER_KEY.length > 0 ? true : false)
    })
})
