import { getSiteConfig } from '../init/testCommon'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { partnerId, sites, spyAllFeaturesMethod } from './test.common'
import { getPartnerFeature, buildSiteDirectory } from './test.common'
import FolderManager from './folderManager'
import Feature from './feature'

jest.mock('axios')
jest.mock('fs')

describe('Partner features test suite', () => {
    const partnerFeature = getPartnerFeature()

    beforeEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()
    })

    describe('Init test suite', () => {
        const operation = 'init'
        beforeEach(() => {
            jest.spyOn(partnerFeature.folderManager, 'getPartnerFolder').mockImplementation(async () => {
                return path.join(FolderManager.getBaseFolder(operation), partnerId)
            })
        })

        test(`${operation} all features executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
            expect(spyesTotalCalls).toBe(partnerFeature.getFeatures().length * sites.length)
        })

        test(`${operation} no partner feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, 'Schema')
            expect(spyesTotalCalls).toBe(0)
        })

        test(`${operation} permission groups feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, partnerFeature.getFeatures()[0].constructor.name)
            expect(spyesTotalCalls).toBe(1 * sites.length)
        })
    })

    describe('Reset test suite', () => {
        const operation = 'reset'
        beforeEach(() => {
            jest.spyOn(partnerFeature.folderManager, 'getPartnerFolder').mockImplementation(async () => {
                return path.join(FolderManager.getBaseFolder(operation), partnerId)
            })
        })

        test(`${operation} all features executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
            expect(spyesTotalCalls).toBe(partnerFeature.getFeatures().length * sites.length)
        })

        test(`${operation} single feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, partnerFeature.getFeatures()[0].constructor.name)
            expect(spyesTotalCalls).toBe(1 * sites.length)
        })
    })

    describe('Build test suite', () => {
        const operation = 'build'
        beforeEach(() => {
            jest.spyOn(partnerFeature.folderManager, 'getPartnerFolder').mockImplementation(async () => {
                return path.join(FolderManager.getBaseFolder(operation), partnerId)
            })
        })

        test('Build all features executed successfully', async () => {
            const getFilesSpy = jest.spyOn(partnerFeature, 'getFiles').mockImplementation(async () => {
                return [
                    path.join('/root/', buildSiteDirectory, 'Schema', 'data.json'),
                    path.join('/root/', buildSiteDirectory, 'WebSdk', 'webSdk.js'),
                    '/root/build/partnerId/Sites/siteDomain/WebSdk/webSdk.js',
                    '/root/anyDirectory/Schema/data.json',
                ]
            })

            const spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
            expect(spyesTotalCalls).toBe(partnerFeature.getFeatures().length * 2)
            expect(getFilesSpy.mock.calls.length).toBe(1)
        })
    })

    describe('Deploy test suite', () => {
        const operation = 'deploy'
        beforeEach(() => {
            jest.spyOn(partnerFeature.folderManager, 'getPartnerFolder').mockImplementation(async () => {
                return path.join(FolderManager.getBaseFolder(operation), partnerId)
            })
        })

        test(`${operation} all features executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
            expect(spyesTotalCalls).toBe(partnerFeature.getFeatures().length * sites.length)
        })

        test(`${operation} no partner feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, 'Schema')
            expect(spyesTotalCalls).toBe(0)
        })

        test(`${operation} permission groups feature executed successfully`, async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, partnerFeature.getFeatures()[0].constructor.name)
            expect(spyesTotalCalls).toBe(1 * sites.length)
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
        if (operation === 'build') {
            result = await partnerFeature[operation](featureName)
        } else {
            result = await partnerFeature[operation](sites, featureName, undefined)
        }
        expect(result).toBeTruthy()
        for (const spy of spies) {
            if (!featureName || (spy.mock.instances.length > 0 && Feature.isEqualCaseInsensitive(spy.mock.instances[0].constructor.name, featureName))) {
                spyesTotalCalls += spy.mock.calls.length
                for (let i = 0; i < spy.mock.calls.length; ++i) {
                    expect(spy.mock.calls[i][0]).toEqual(path.join(FolderManager.getBaseFolder(operation), partnerId))
                }
            } else {
                expect(spy.mock.calls.length).toBe(0)
            }
        }
        return spyesTotalCalls
    }
})
