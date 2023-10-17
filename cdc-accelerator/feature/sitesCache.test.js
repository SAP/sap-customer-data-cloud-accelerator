import { apiKey, credentials, partnerIds, siteDomain, sites, config } from './test.common.js'
import SitesCache from './sitesCache.js'
import SiteFinderPaginated from '../sap-cdc-toolkit/search/siteFinderPaginated.js'
import fs from 'fs'
import { CONFIG_FILENAME } from './constants'

jest.mock('../sap-cdc-toolkit/search/siteFinderPaginated.js')
jest.mock('fs')

describe('SitesCache test suite', () => {
    const expectedSite0Info = {
        apiKey: sites[0].apiKey,
        baseDomain: sites[0].siteDomain,
        dataCenter: 'us1',
        partnerId: partnerIds[0],
        partnerName: partnerIds[0],
    }

    const expectedSite1Info = {
        apiKey: sites[1].apiKey,
        baseDomain: sites[1].siteDomain,
        dataCenter: 'us1',
        partnerId: partnerIds[1],
        partnerName: partnerIds[1],
    }

    const expectedAnotherSiteInfo = {
        apiKey: apiKey,
        baseDomain: siteDomain,
        dataCenter: 'us1',
        partnerId: partnerIds[1],
        partnerName: partnerIds[1],
    }

    beforeEach(() => {
        SitesCache.cache = []
    })

    test('cache must be initiated from the network', async () => {
        const getFirstPageSpy = jest.spyOn(SiteFinderPaginated.prototype, 'getFirstPage').mockReturnValue([expectedSite0Info, expectedSite1Info])
        const getNextPageSpy = jest.spyOn(SiteFinderPaginated.prototype, 'getNextPage').mockReturnValueOnce([expectedAnotherSiteInfo]).mockReturnValue(undefined)
        jest.spyOn(SitesCache, 'getConfiguration').mockImplementation(() => {
            return config
        })
        fs.readFileSync.mockReturnValue(JSON.stringify(config))
        fs.writeFileSync.mockReturnValue(undefined)

        expect(SitesCache.cache).toEqual([])
        await SitesCache.init(credentials)
        expect(SitesCache.cache.length).toBe(2)
        expect(getFirstPageSpy).toHaveBeenCalled()
        expect(getNextPageSpy).toHaveBeenCalled()
        const configContent = config
        configContent.cache = [expectedSite0Info, expectedSite1Info]
        expect(fs.writeFileSync).toHaveBeenCalledWith(CONFIG_FILENAME, JSON.stringify(configContent, null, 4))
    })

    test('cache must be loaded from file single record', async () => {
        jest.spyOn(SitesCache, 'getConfiguration').mockImplementation(() => {
            return {
                cache: expectedSite0Info,
            }
        })
        expect(SitesCache.cache).toEqual([])
        await SitesCache.load(credentials)
        expect(SitesCache.cache.length).toBe(1)
        expect(SitesCache.cache).toStrictEqual([expectedSite0Info])
    })

    test('cache must be loaded from file multiple records', async () => {
        jest.spyOn(SitesCache, 'getConfiguration').mockImplementation(() => {
            const config = {
                cache: [expectedSite0Info, expectedAnotherSiteInfo],
            }
            return config
        })
        expect(SitesCache.cache).toEqual([])
        await SitesCache.load(credentials)
        expect(SitesCache.cache.length).toBe(2)
        expect(SitesCache.cache).toStrictEqual([expectedSite0Info, expectedAnotherSiteInfo])
    })

    test('cache do not exists on file', async () => {
        jest.spyOn(SitesCache, 'getConfiguration').mockReturnValueOnce({})
        await expect(() => SitesCache.load()).rejects.toThrow(Error)
    })

    test('cache do not exists on file but is recreated', async () => {
        jest.spyOn(SiteFinderPaginated.prototype, 'getFirstPage').mockReturnValue([expectedSite0Info, expectedSite1Info])
        jest.spyOn(SiteFinderPaginated.prototype, 'getNextPage').mockReturnValueOnce([expectedAnotherSiteInfo]).mockReturnValueOnce(undefined)
        expect(SitesCache.cache.length).toBe(0)
        jest.spyOn(SitesCache, 'getConfiguration').mockReturnValueOnce({}).mockReturnValueOnce(config)
        await SitesCache.load(credentials)
        expect(SitesCache.cache.length).toBe(2)
    })
})
