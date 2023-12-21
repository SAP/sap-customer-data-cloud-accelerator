import { getSiteConfig } from './test.gigyaResponses.js'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { partnerIds, sites, spyAllFeaturesMethod, getPartnerFeature, getBaseFolder, srcSiteDirectory, partnerBaseDirectory } from './test.common.js'
import Feature from '../../core/feature.js'
import { Operations, SRC_DIRECTORY } from '../../core/constants.js'
import Directory from '../../core/directory.js'

jest.mock('axios')
jest.mock('fs')
jest.mock('../../core/sitesCache.js')

describe('Partner features test suite', () => {
    const partnerFeature = getPartnerFeature()
    let sitesOnTest = sites

    beforeEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()
    })

    describe('Init test suite', () => {
        const operation = Operations.init

        test(`${operation} all features executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
            expect(spyesTotalCalls).toBe(sites.length)
        })

        test(`${operation} no partner feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, 'Schema')
            expect(spyesTotalCalls).toBe(0)
        })

        test(`${operation} permission groups feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, partnerFeature.getFeatures()[0].constructor.name)
            expect(spyesTotalCalls).toBe(sites.length)
        })
    })

    describe('Reset test suite', () => {
        const operation = Operations.reset

        test(`${operation} all features executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
            expect(spyesTotalCalls).toBe(sites.length)
        })

        test(`${operation} single feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, partnerFeature.getFeatures()[0].constructor.name)
            expect(spyesTotalCalls).toBe(sites.length)
        })
    })

    describe('Build test suite', () => {
        const operation = Operations.build

        test('Build all features executed successfully', async () => {
            const getFilesSpy = jest.spyOn(Directory, 'read').mockImplementation(async () => {
                return [
                    path.join('/root/', partnerBaseDirectory, 'PermissionGroups', 'PermissionGroups.json'),
                    path.join('/root/', srcSiteDirectory, 'WebSdk', 'webSdk.js'),
                    path.join('/root/', SRC_DIRECTORY, partnerIds[1], 'PermissionGroups', 'PermissionGroups.json'),
                    path.join('/root/', 'anyDirectory', 'Schema', 'data.json'),
                ]
            })

            const spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
            expect(spyesTotalCalls).toBe(sites.length)
            expect(getFilesSpy.mock.calls.length).toBe(1)
        })
    })

    describe('Deploy test suite', () => {
        const operation = Operations.deploy

        test(`${operation} all features executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
            expect(spyesTotalCalls).toBe(sites.length)
        })

        test(`${operation} no partner feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, 'Schema')
            expect(spyesTotalCalls).toBe(0)
        })

        test(`${operation} permission groups feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, partnerFeature.getFeatures()[0].constructor.name)
            expect(spyesTotalCalls).toBe(sites.length)
        })
    })

    const operations = [[Operations.init], [Operations.reset], [Operations.deploy]]
    test.each(operations)(`%s filter features`, async (operation) => {
        jest.restoreAllMocks()
        jest.clearAllMocks()
        sitesOnTest[0]['features'] = ['PermissionGroups', 'Schema', 'WebSdk', 'Policies', 'WebScreenSets', 'EmailTemplates']
        sitesOnTest[1]['features'] = ['PermissionGroups', 'Schema', 'WebSdk', 'Policies', 'WebScreenSets', 'EmailTemplates']
        let spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
        expect(spyesTotalCalls).toBe(partnerFeature.getFeatures().length * sites.length)

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
        expect(spyesTotalCalls).toBe(partnerFeature.getFeatures().length * sites.length)

        jest.restoreAllMocks()
        jest.clearAllMocks()
        sitesOnTest[0]['features'] = ['PermissionGroups']
        sitesOnTest[1]['features'] = ['PermissionGroups']
        sitesOnTest[1].partnerName = partnerIds[0]
        spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
        sitesOnTest[1].partnerName = partnerIds[1]
        expect(spyesTotalCalls).toBe(1)
    })

    async function executeTestAndCountCalls(operation, featureName) {
        let spyesTotalCalls = 0

        axios.mockResolvedValueOnce({ data: getSiteConfig })

        fs.existsSync.mockReturnValue(true)
        fs.mkdirSync.mockReturnValue(undefined)
        fs.writeFileSync.mockReturnValue(undefined)

        const spies = spyAllFeaturesMethod(partnerFeature, operation)
        let result
        if (operation === Operations.build) {
            result = await partnerFeature[operation](featureName)
        } else {
            result = await partnerFeature[operation](sites, featureName, undefined)
        }
        expect(result).toBeTruthy()
        for (const spy of spies) {
            if (!featureName || (spy.mock.instances.length > 0 && Feature.isEqualCaseInsensitive(spy.mock.instances[0].constructor.name, featureName))) {
                spyesTotalCalls += spy.mock.calls.length
                for (let i = 0; i < spy.mock.calls.length; ++i) {
                    expect(spy.mock.calls[i][0]).toEqual(path.join(getBaseFolder(operation), partnerIds[i]))
                }
            } else {
                expect(spy.mock.calls.length).toBe(0)
            }
        }
        return spyesTotalCalls
    }
})
