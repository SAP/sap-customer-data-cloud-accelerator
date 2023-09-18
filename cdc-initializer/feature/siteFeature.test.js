import { expectedGigyaResponseNok, getSiteConfig } from '../init/testCommon'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import SiteFeature from './siteFeature'
import Schema from './schema'
import WebSdk from './webSdk'
import Policies from './policies'
import { siteDirectory, siteBaseDirectory, getSiteFeature } from './test.common'

jest.mock('axios')
jest.mock('fs')

describe('Site features test suite', () => {
    const siteFeature = getSiteFeature()
    const sites = [
        { apiKey: '4_Ch-q_qKrjBJ_-QBEfMPkKA', siteDomain: 'cdc-accelerator.parent.site-group.com' },
        { apiKey: '4_tqmAZeYVLPfPl9SYu_iFxA', siteDomain: 'cdc-accelerator.preferences-center.com' },
    ]
    let siteFeatureSpy

    beforeEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()

        siteFeatureSpy = jest.spyOn(siteFeature.folderManager, 'getSiteFolder').mockImplementation(async () => {
            return siteDirectory
        })
        siteFeatureSpy = jest.spyOn(siteFeature.folderManager, 'getSiteBaseFolder').mockImplementation(async () => {
            return siteBaseDirectory
        })
    })

    describe('Init test suite', () => {
        const operation = 'init'

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
        const operation = 'reset'

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
        const operation = 'build'

        test('Build all features executed successfully', async () => {
            const getFilesSpy = jest.spyOn(siteFeature, 'getFiles').mockImplementation(async () => {
                return [
                    path.join('/root/', siteDirectory, 'Schema', 'data.json'),
                    path.join('/root/', siteDirectory, 'WebSdk', 'webSdk.js'),
                    '/root/src/partnerId/siteDomain/Sites/WebSdk/webSdk.js',
                    '/root/anyDirectory/Schema/data.json',
                ]
            })

            const spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
            expect(spyesTotalCalls).toBe(siteFeature.getFeatures().length * 2)
            expect(getFilesSpy.mock.calls.length).toBe(1)
        })
    })

    describe('Deploy test suite', () => {
        const operation = 'deploy'

        test('Deploy all features executed successfully', async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
            expect(spyesTotalCalls).toBe(siteFeature.getFeatures().length * sites.length)
        })

        test('Deploy schema feature executed successfully', async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, 'Schema')
            expect(spyesTotalCalls).toBe(1 * sites.length)
        })

        test('Deploy websdk feature executed successfully', async () => {
            const spyesTotalCalls = await executeTestAndCountCalls(operation, 'WebSdk')
            expect(spyesTotalCalls).toBe(1 * sites.length)
        })

        test('Deploy policies feature executed successfully', async () => {
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

    async function executeTestAndCountCalls(operation, featureName) {
        let spyesTotalCalls = 0
        axios.mockResolvedValueOnce({ data: getSiteConfig })

        fs.existsSync.mockReturnValue(true)
        fs.mkdirSync.mockReturnValue(undefined)
        fs.writeFileSync.mockReturnValue(undefined)

        const spies = spyAllFeaturesMethod(operation)
        let result
        if (operation === 'build') {
            result = await siteFeature[operation](featureName)
        } else {
            result = await siteFeature[operation](sites, featureName, undefined)
        }
        expect(result).toBeTruthy()
        for (const spy of spies) {
            if (!featureName || (spy.mock.instances.length > 0 && SiteFeature.isEqualCaseInsensitive(spy.mock.instances[0].constructor.name, featureName))) {
                spyesTotalCalls += spy.mock.calls.length
            } else {
                expect(spy.mock.calls.length).toBe(0)
            }
        }
        return spyesTotalCalls
    }

    function spyAllFeaturesMethod(method) {
        const spies = []
        for (const f of siteFeature.getFeatures()) {
            spies.push(jest.spyOn(f, method).mockImplementation(() => {}))
        }
        return spies
    }
})
