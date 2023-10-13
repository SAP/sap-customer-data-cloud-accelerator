import { getSiteConfig } from './test.gigyaResponses'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { apiKey, partnerIds, siteDomain, sites, spyAllFeaturesMethod, getPartnerFeature, buildSiteDirectory } from './test.common.js'
import FolderManager from './folderManager.js'
import Feature from './feature.js'
import { Operations, SITES_DIRECTORY } from './constants.js'

jest.mock('axios')
jest.mock('fs')
jest.mock('./sitesCache.js')

describe('Partner features test suite', () => {
    const partnerFeature = getPartnerFeature()

    beforeEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()

        jest.spyOn(FolderManager, 'getSiteInfo')
            .mockImplementationOnce(async () => {
                return {
                    apiKey: apiKey,
                    baseDomain: siteDomain,
                    dataCenter: 'us1',
                    partnerId: partnerIds[0],
                    partnerName: partnerIds[0],
                }
            })
            .mockImplementationOnce(async () => {
                return {
                    apiKey: `another_${apiKey}`,
                    baseDomain: `another_${siteDomain}`,
                    dataCenter: 'us1',
                    partnerId: partnerIds[1],
                    partnerName: partnerIds[1],
                }
            })
    })

    describe('Init test suite', () => {
        const operation = Operations.init
        beforeEach(() => {
            mockFolderManager(operation)
        })

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
        beforeEach(() => {
            mockFolderManager(operation)
        })

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
        beforeEach(() => {
            mockFolderManager(operation)
        })

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
            expect(spyesTotalCalls).toBe(partnerIds.length)
            expect(getFilesSpy.mock.calls.length).toBe(1)
        })
    })

    describe('Deploy test suite', () => {
        const operation = Operations.deploy
        beforeEach(() => {
            mockFolderManager(operation)
        })

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
                    expect(spy.mock.calls[i][1]).toEqual(path.join(FolderManager.getBaseFolder(operation), partnerIds[i]))
                }
            } else {
                expect(spy.mock.calls.length).toBe(0)
            }
        }
        return spyesTotalCalls
    }

    function mockFolderManager(operation) {
        jest.spyOn(FolderManager, 'getPartnerFolder')
            .mockImplementationOnce(async () => {
                return path.join(FolderManager.getBaseFolder(operation), partnerIds[0])
            })
            .mockImplementationOnce(async () => {
                return path.join(FolderManager.getBaseFolder(operation), partnerIds[1])
            })

        //jest.spyOn(partnerFeature.folderManager, 'getSiteBaseFolder')
        jest.spyOn(FolderManager, 'getSiteBaseFolder')
            .mockImplementationOnce(async () => {
                return path.join(FolderManager.getBaseFolder(operation), partnerIds[0], SITES_DIRECTORY, siteDomain)
            })
            .mockImplementationOnce(async () => {
                return path.join(FolderManager.getBaseFolder(operation), partnerIds[1], SITES_DIRECTORY, siteDomain)
            })
    }
})
