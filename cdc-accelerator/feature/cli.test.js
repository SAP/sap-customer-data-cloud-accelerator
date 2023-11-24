/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import CLI from './cli.js'
import { getSiteFeature, credentials, config } from './test.common.js'
import Accelerator from './accelerator.js'
import PartnerFeature from './partnerFeature.js'
import { Operations } from './constants.js'

jest.mock('./accelerator.js')
jest.mock('./configuration.js')

describe('CLI test suite', () => {
    const processExecutable = 'cdc-accelerator/feature/index.js'
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

    test('main successfully', async () => {
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

        const result = await cli.main(process, process.argv[2], process.argv[3], process.argv[4])
        expect(result).toBeTruthy()
    })
})
