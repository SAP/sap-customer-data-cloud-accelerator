import {apiKey, credentials, partnerIds, siteDomain} from "./test.common";
import SitesCache from "./sitesCache";
import SiteFinderPaginated from '../sap-cdc-toolkit/search/siteFinderPaginated.js'

jest.mock('../sap-cdc-toolkit/search/siteFinderPaginated.js')

describe('SitesCache test suite', () => {
    let sitesCache
    const expectedSiteInfo = {
        apiKey: apiKey,
        baseDomain: siteDomain,
        dataCenter: 'us1',
        partnerId: partnerIds[0],
        partnerName: partnerIds[0],
    }

    beforeAll(() => {
        SiteFinderPaginated.mockImplementation(() => {
            return {
                getFirstPage: () => {
                    return [expectedSiteInfo]
                },
                getNextPage: () => {
                    return [expectedSiteInfo]
                },
            }
        })
    })
    beforeEach(() => {
        //jest.clearAllMocks()
        sitesCache = new SitesCache(credentials)
        SitesCache.lastSiteCache = {}
        SitesCache.cache = []
    })

    test('get site info using site last cache', async () => {
        const getFirstPageSpy = jest.spyOn(SiteFinderPaginated.prototype, 'getFirstPage')
        SitesCache.lastSiteCache = expectedSiteInfo
        const siteInfo = await sitesCache.getSiteInfo(apiKey)
        expect(siteInfo).toBeDefined()
        expect(getFirstPageSpy).not.toHaveBeenCalled()
    })

    test('site info not found', async () => {
        const getFirstPageSpy = jest.spyOn(SiteFinderPaginated.prototype, 'getFirstPage')
        SitesCache.cache = [expectedSiteInfo]
        const siteInfo = await sitesCache.getSiteInfo(apiKey + 'X')
        expect(siteInfo).toBeUndefined()
        expect(getFirstPageSpy).not.toHaveBeenCalled()
    })

    test('site info found', async () => {
        const getFirstPageSpy = jest.spyOn(SiteFinderPaginated.prototype, 'getFirstPage')
        SitesCache.cache = [expectedSiteInfo]
        expect(SitesCache.lastSiteCache).toEqual({})
        const siteInfo = await sitesCache.getSiteInfo(apiKey)
        expect(siteInfo).toBeDefined()
        expect(SitesCache.lastSiteCache).not.toEqual({})
        expect(getFirstPageSpy).not.toHaveBeenCalled()
    })
/*
    test('cache must be initiated', async () => {
        const getFirstPageSpy = jest.spyOn(SiteFinderPaginated.prototype, 'getFirstPage')
        expect(SitesCache.lastSiteCache).toEqual({})
        expect(SitesCache.cache).toEqual([])
        const siteInfo = await sitesCache.getSiteInfo(apiKey)
        expect(siteInfo).toBeDefined()
        expect(SitesCache.lastSiteCache).not.toEqual({})
        expect(SitesCache.cache).not.toEqual([])
        expect(getFirstPageSpy).toHaveBeenCalled()
    })

 */
})
