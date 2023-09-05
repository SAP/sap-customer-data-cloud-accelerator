/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import CLI from "./cli"

describe('CLI test suite', () => {
    const cli = new CLI()
    const config = {
        "source": [
            { "apiKey": "4_Ch-q_qKrjBJ_-QBEfMPkKA", "siteDomain": "cdc-accelerator.parent.site-group.com" },
            { "apiKey": "4_tqmAZeYVLPfPl9SYu_iFxA", "siteDomain": "cdc-accelerator.preferences-center.com" },
        ],
        "deploy": [
            { "apiKey": "4_gxvAD6fBxrCScvH8bBm7Vw", "siteDomain": "cdc-accelerator.parent.site-group.com" }
        ]
    }

    beforeAll(() => {
        jest.spyOn(CLI.prototype, 'getConfigurationByEnvironment').mockImplementation(() => { return config });
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    test('parseArguments with phase deploy and feature name', async () => {
        const processArgv = [
            'node',
            'cdc-initializer/feature/index.js',
            'deploy',   // phase
            'webSdk',   // feature name
            'dev'       // environment
        ]

        const { phase, sites, featureName, environment } = cli.parseArguments(processArgv)
        expect(phase).toEqual(processArgv[2])
        expect(featureName).toEqual(processArgv[3])
        expect(environment).toEqual(processArgv[4])
        expect(sites).toEqual(config[processArgv[2]])
        // expect single call to websdk
    })

    test('parseArguments with phase init and feature name', async () => {
        const processArgv = [
            'node',
            'cdc-initializer/feature/index.js',
            'init',     // phase
            'webSdk',   // feature name
            'dev'       // environment
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
            'init',   // phase
            'dev'     // environment
        ]
        const { phase, sites, featureName, environment } = cli.parseArguments(processArgv)
        expect(phase).toEqual(processArgv[2])
        expect(featureName).toBeUndefined()
        expect(environment).toEqual(processArgv[3])
        expect(sites).toEqual(config.source)
    })
})
