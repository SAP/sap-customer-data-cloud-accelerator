import { getSiteConfig } from './test.gigyaResponses'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { partnerIds, sites, spyAllFeaturesMethod, getPartnerFeature, buildSiteDirectory } from './test.common.js'
import Feature from './feature.js'
import { BUILD_DIRECTORY, Operations, SRC_DIRECTORY } from './constants.js'

jest.mock('axios')
jest.mock('fs')
jest.mock('./sitesCache.js')

describe('Partner features test suite', () => {
    const partnerFeature = getPartnerFeature()

    beforeEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()
    })

    describe('Init test suite', () => {
        const operation = Operations.init

        test(`${operation} all features executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
            expect(spyesTotalCalls).toBe(partnerIds.length)
        })

        test(`${operation} no partner feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, 'Schema')
            expect(spyesTotalCalls).toBe(0)
        })

        test(`${operation} permission groups feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, partnerFeature.getFeatures()[0].constructor.name)
            expect(spyesTotalCalls).toBe(partnerIds.length)
        })
    })

    describe('Reset test suite', () => {
        const operation = Operations.reset

        test(`${operation} all features executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
            expect(spyesTotalCalls).toBe(partnerIds.length)
        })

        test(`${operation} single feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, partnerFeature.getFeatures()[0].constructor.name)
            expect(spyesTotalCalls).toBe(partnerIds.length)
        })
    })

    describe('Build test suite', () => {
        const operation = Operations.build

        test('Build all features executed successfully', async () => {
            const getFilesSpy = jest.spyOn(partnerFeature, 'getFiles').mockImplementation(async () => {
                return [
                    path.join('/root/', buildSiteDirectory, 'Schema', 'data.json'),
                    path.join('/root/', buildSiteDirectory, 'WebSdk', 'webSdk.js'),
                    `/root/build/${partnerIds[1]}/Sites/siteDomain/WebSdk/webSdk.js`,
                    '/root/anyDirectory/Schema/data.json',
                ]
            })

            const spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
            expect(spyesTotalCalls).toBe(1)
            expect(getFilesSpy.mock.calls.length).toBe(1)
        })
    })

    describe('Deploy test suite', () => {
        const operation = Operations.deploy

        test(`${operation} all features executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
            expect(spyesTotalCalls).toBe(partnerIds.length)
        })

        test(`${operation} no partner feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, 'Schema')
            expect(spyesTotalCalls).toBe(0)
        })

        test(`${operation} permission groups feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, partnerFeature.getFeatures()[0].constructor.name)
            expect(spyesTotalCalls).toBe(partnerIds.length)
        })
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

    function getBaseFolder(operation) {
        let baseFolder
        switch (operation) {
            case Operations.init:
            case Operations.reset:
                baseFolder = SRC_DIRECTORY
                break
            case Operations.build:
            case Operations.deploy:
                baseFolder = BUILD_DIRECTORY
                break
            default:
                baseFolder = ''
                break
        }
        return baseFolder
    }
})
