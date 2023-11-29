import { expectedGigyaResponseNok, getSiteConfig } from './test.gigyaResponses.js'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { sites, getSiteFeature, spyAllFeaturesMethod, partnerIds, getBaseFolder } from '../test.common.js'
import Feature from '../../core/feature.js'
import { Operations, SITES_DIRECTORY, BUILD_DIRECTORY } from '../../core/constants.js'

jest.mock('axios')
jest.mock('fs')

describe('Site features test suite', () => {
    const siteFeature = getSiteFeature()
    let sitesOnTest = sites

    beforeEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()
    })

    describe('Init test suite', () => {
        const operation = Operations.init

        test(`${operation} all features executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
            expect(spyesTotalCalls).toBe(siteFeature.getFeatures().length * sites.length)
        })

        test(`${operation} schema feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, 'Schema')
            expect(spyesTotalCalls).toBe(1 * sites.length)
        })

        test(`${operation} websdk feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, 'WebSdk')
            expect(spyesTotalCalls).toBe(1 * sites.length)
        })

        test(`${operation} policies feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, 'Policies')
            expect(spyesTotalCalls).toBe(1 * sites.length)
        })

        test(`${operation} error getting site configuration`, async () => {
            axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
            fs.existsSync.mockReturnValue(false)
            fs.mkdirSync.mockReturnValue(undefined)
            await expect(siteFeature[operation](sites, undefined, undefined)).rejects.toThrow(Error)
        })
    })

    describe('Reset test suite', () => {
        const operation = Operations.reset

        test(`${operation} all features executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
            expect(spyesTotalCalls).toBe(siteFeature.getFeatures().length * sites.length)
        })

        test(`${operation} single feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, 'schema')
            expect(spyesTotalCalls).toBe(1 * sites.length)
        })
    })

    describe('Build test suite', () => {
        const operation = Operations.build

        test(`${operation} all features executed successfully`, async () => {
            const getFilesSpy = jest.spyOn(siteFeature, 'getFiles').mockImplementation(async () => {
                return [
                    path.join('/root/', BUILD_DIRECTORY, partnerIds[0], SITES_DIRECTORY, sites[0].baseDomain, 'Schema', 'data.json'),
                    path.join('/root/', BUILD_DIRECTORY, partnerIds[1], SITES_DIRECTORY, sites[1].baseDomain, 'WebSdk', 'webSdk.js'),
                    '/root/anyDirectory/Schema/data.json',
                ]
            })

            const spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
            expect(spyesTotalCalls).toBe(siteFeature.getFeatures().length * 2)
            expect(getFilesSpy.mock.calls.length).toBe(2)
        })
    })

    describe('Deploy test suite', () => {
        const operation = Operations.deploy

        test(`${operation} all features executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
            expect(spyesTotalCalls).toBe(siteFeature.getFeatures().length * sites.length)
        })

        test(`${operation} schema feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, 'Schema')
            expect(spyesTotalCalls).toBe(1 * sites.length)
        })

        test(`${operation} websdk feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, 'WebSdk')
            expect(spyesTotalCalls).toBe(1 * sites.length)
        })

        test(`${operation} policies feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, 'Policies')
            expect(spyesTotalCalls).toBe(1 * sites.length)
        })

        test('Error getting site configuration', async () => {
            axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
            fs.existsSync.mockReturnValue(false)
            fs.mkdirSync.mockReturnValue(undefined)
            await expect(siteFeature[operation](sites, undefined, undefined)).rejects.toThrow(Error)
        })
    })

    const operations = [[Operations.init], [Operations.reset], [Operations.deploy]]
    test.each(operations)(`%s filter features`, async (operation) => {
        sitesOnTest[0]['features'] = ['PermissionGroups', 'Schema', 'WebSdk', 'Policies', 'WebScreenSets', 'EmailTemplates']
        sitesOnTest[1]['features'] = ['PermissionGroups', 'Schema', 'WebSdk', 'Policies', 'WebScreenSets', 'EmailTemplates']
        let spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
        expect(spyesTotalCalls).toBe(siteFeature.getFeatures().length * sites.length)

        jest.restoreAllMocks()
        jest.clearAllMocks()
        sitesOnTest[0]['features'] = ['PermissionGroups', 'Policies']
        sitesOnTest[1]['features'] = ['PermissionGroups', 'Policies']
        spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
        expect(spyesTotalCalls).toBe(1 * sites.length)

        jest.restoreAllMocks()
        jest.clearAllMocks()
        sitesOnTest[0]['features'] = []
        sitesOnTest[1]['features'] = []
        spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
        expect(spyesTotalCalls).toBe(0)

        jest.restoreAllMocks()
        jest.clearAllMocks()
        sitesOnTest[0]['features'] = undefined
        sitesOnTest[1]['features'] = undefined
        spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
        expect(spyesTotalCalls).toBe(siteFeature.getFeatures().length * sites.length)
    })

    async function executeTestAndCountCalls(operation, featureName) {
        let spyesTotalCalls = 0
        axios.mockResolvedValue({ data: getSiteConfig })

        fs.existsSync.mockReturnValue(true)
        fs.mkdirSync.mockReturnValue(undefined)
        fs.writeFileSync.mockReturnValue(undefined)

        const spies = spyAllFeaturesMethod(siteFeature, operation)
        let result
        if (operation === Operations.build) {
            result = await siteFeature[operation](featureName)
        } else {
            result = await siteFeature[operation](sitesOnTest, featureName, undefined)
        }
        expect(result).toBeTruthy()

        let directoryIndex = 2
        if (operation === Operations.build || operation === Operations.reset) {
            directoryIndex = 0
        }
        for (const spy of spies) {
            if (!featureName || (spy.mock.instances.length > 0 && Feature.isEqualCaseInsensitive(spy.mock.instances[0].constructor.name, featureName))) {
                spyesTotalCalls += spy.mock.calls.length
                for (let i = 0; i < spy.mock.calls.length; ++i) {
                    expect(spy.mock.calls[i][directoryIndex]).toEqual(path.join(getBaseFolder(operation), partnerIds[i], SITES_DIRECTORY, sites[i].baseDomain))
                }
            } else {
                expect(spy.mock.calls.length).toBe(0)
            }
        }
        return spyesTotalCalls
    }
})
