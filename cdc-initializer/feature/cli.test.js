/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import CLI from './cli.js'
import { getSiteFeature, credentials, sites } from './test.common.js'
import Accelerator from './accelerator.js'
import SiteFeature from './siteFeature.js'
import PartnerFeature from './partnerFeature.js'
import { Operations } from './constants'

jest.mock('./accelerator.js')

describe('CLI test suite', () => {
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

    const config = {
        source: sites,
        deploy: { apiKey: '1_Eh-x_qKjjBJ_-QBEfMDABC', siteDomain: 'cdc-accelerator.parent.site-group.com' },
    }

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

    test('parseArguments with phase deploy and feature name', async () => {
        const processArgv = [
            'node',
            'cdc-initializer/feature/index.js',
            Operations.deploy, // phase
            'webSdk', // feature name
            'dev', // environment
        ]

        const { phase, sites, featureName, environment } = cli.parseArguments(processArgv)
        expect(phase).toEqual(processArgv[2])
        expect(featureName).toEqual(processArgv[3])
        expect(environment).toEqual(processArgv[4])
        const expectedSites = Array.isArray(config[processArgv[2]]) ? config[processArgv[2]] : [config[processArgv[2]]]
        expect(sites).toEqual(expectedSites)
    })

    test('parseArguments with phase init and feature name', async () => {
        const processArgv = [
            'node',
            'cdc-initializer/feature/index.js',
            Operations.init, // phase
            'WebSdk', // feature name
            'dev', // environment
        ]
        const { phase, sites, featureName, environment } = cli.parseArguments(processArgv)
        expect(phase).toEqual(processArgv[2])
        expect(featureName).toEqual(processArgv[3])
        expect(environment).toEqual(processArgv[4])
        expect(sites).toEqual(config.source)
    })

    test('parseArguments with phase init and environment', async () => {
        const processArgv = [
            'node',
            'cdc-initializer/feature/index.js',
            Operations.init, // phase
            'dev', // environment
        ]
        const { phase, sites, featureName, environment } = cli.parseArguments(processArgv)
        expect(phase).toEqual(processArgv[2])
        expect(featureName).toBeUndefined()
        expect(environment).toEqual(processArgv[3])
        expect(sites).toEqual(config.source)
    })

    test('parseArguments with phase init', async () => {
        const processArgv = [
            'node',
            'cdc-initializer/feature/index.js',
            Operations.init, // phase
        ]
        const { phase, sites, featureName, environment } = cli.parseArguments(processArgv)
        expect(phase).toEqual(processArgv[2])
        expect(featureName).toBeUndefined()
        expect(environment).toBeUndefined()
        expect(sites).toEqual(config.source)
    })

    test('parseArguments with unknown phase', async () => {
        const processArgv = [
            'node',
            'cdc-initializer/feature/index.js',
            'unknown', // phase
        ]
        expect(() => cli.parseArguments(processArgv)).toThrow('Cannot find configuration')
    })

    test('parseArguments with no features', async () => {
        const processArgv = [
            'node',
            'cdc-initializer/feature/index.js',
            'unknown', // phase
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
                'cdc-initializer/feature/index.js',
                Operations.init, // phase
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
