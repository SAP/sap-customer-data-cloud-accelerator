/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import CLI from './cli.js'
import { getSiteFeature, credentials, config } from './test.common.js'
import Accelerator from './accelerator.js'
import SiteFeature from './siteFeature.js'
import PartnerFeature from './partnerFeature.js'
import { Operations } from './constants.js'

jest.mock('./accelerator.js')

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
        jest.spyOn(CLI.prototype, 'getConfigurationByEnvironment').mockImplementation(() => {
            return config
        })
        cli.siteFeature = getSiteFeature()
        cli.partnerFeature = new PartnerFeature(credentials)
    })

    afterAll(() => {
        jest.restoreAllMocks()
    })

    test('parseArguments with operation deploy and feature name', async () => {
        const processArgv = [
            'node',
            processExecutable,
            Operations.deploy, // operation
            'webSdk', // feature name
            'dev', // environment
        ]

        const { operation, sites, featureName, environment } = cli.parseArguments(processArgv)
        expect(operation).toEqual(processArgv[2])
        expect(featureName).toEqual(processArgv[3])
        expect(environment).toEqual(processArgv[4])
        const expectedSites = Array.isArray(config[processArgv[2]]) ? config[processArgv[2]] : [config[processArgv[2]]]
        expect(sites).toEqual(expectedSites)
    })

    test('parseArguments with operation init and feature name', async () => {
        const processArgv = [
            'node',
            processExecutable,
            Operations.init, // operation
            'WebSdk', // feature name
            'dev', // environment
        ]
        const { operation, sites, featureName, environment } = cli.parseArguments(processArgv)
        expect(operation).toEqual(processArgv[2])
        expect(featureName).toEqual(processArgv[3])
        expect(environment).toEqual(processArgv[4])
        expect(sites).toEqual(config.source)
    })

    test('parseArguments with operation init and environment', async () => {
        const processArgv = [
            'node',
            processExecutable,
            Operations.init, // operation
            'dev', // environment
        ]
        const { operation, sites, featureName, environment } = cli.parseArguments(processArgv)
        expect(operation).toEqual(processArgv[2])
        expect(featureName).toBeUndefined()
        expect(environment).toEqual(processArgv[3])
        expect(sites).toEqual(config.source)
    })

    test('parseArguments with operation init', async () => {
        const processArgv = [
            'node',
            processExecutable,
            Operations.init, // operation
        ]
        const { operation, sites, featureName, environment } = cli.parseArguments(processArgv)
        expect(operation).toEqual(processArgv[2])
        expect(featureName).toBeUndefined()
        expect(environment).toBeUndefined()
        expect(sites).toEqual(config.source)
    })

    test('parseArguments with unknown operation', async () => {
        const processArgv = [
            'node',
            processExecutable,
            'unknown', // operation
        ]
        expect(() => cli.parseArguments(processArgv)).toThrow('The operation argument is not supported. Please use init,reset,build,deploy')
    })

    test('parseArguments with no features', async () => {
        const processArgv = [
            'node',
            processExecutable,
            'unknown', // operation
        ]
        try {
            cli.siteFeature = undefined
            expect(() => cli.parseArguments(processArgv)).toThrow('No features registered, nothing to do!')
            cli.siteFeature = new SiteFeature(credentials)
            expect(() => cli.parseArguments(processArgv)).toThrow('No features registered, nothing to do!')
        } finally {
            cli.siteFeature = getSiteFeature()
        }
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

        const result = await cli.main(process)
        expect(result).toBeTruthy()
    })
})
