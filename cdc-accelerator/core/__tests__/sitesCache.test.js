import { apiKey, credentials, partnerIds, siteDomain, sites, config } from '../../feature/__tests__/test.common.js'
import SitesCache from '../sitesCache.js'
import SiteFinderPaginated from '../../sap-cdc-toolkit/search/siteFinderPaginated.js'

jest.mock('../../sap-cdc-toolkit/search/siteFinderPaginated.js')

describe('SitesCache test suite', () => {
    const expectedSite0Info = sites[0]

    const expectedSite1Info = sites[1]

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

        expect(SitesCache.cache).toEqual([])
        const cache = await SitesCache.load(credentials, config)
        expect(SitesCache.cache.length).toBe(config.source.length)
        expect(getFirstPageSpy).toHaveBeenCalled()
        expect(getNextPageSpy).toHaveBeenCalled()
        expect(cache).toStrictEqual([expectedSite0Info, expectedSite1Info])
    })

    test('cache must be loaded from file single record', async () => {
        expect(SitesCache.cache).toEqual([])
        await SitesCache.load(credentials, { ...config, cache: expectedSite0Info })
        expect(SitesCache.cache.length).toBe(1)
        expect(SitesCache.cache).toStrictEqual([expectedSite0Info])
    })

    test('cache must be loaded from file multiple records', async () => {
        expect(SitesCache.cache).toEqual([])
        await SitesCache.load(credentials, { ...config, cache: [expectedSite0Info, expectedAnotherSiteInfo] })
        expect(SitesCache.cache.length).toBe(2)
        expect(SitesCache.cache).toStrictEqual([expectedSite0Info, expectedAnotherSiteInfo])
    })
})
