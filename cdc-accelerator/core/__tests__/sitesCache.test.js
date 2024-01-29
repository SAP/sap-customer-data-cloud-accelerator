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
    let getFirstPageSpy, getNextPageSpy, isCacheUpdatedSpy

    beforeEach(() => {
        SitesCache.cache = []
        getFirstPageSpy = jest.spyOn(SiteFinderPaginated.prototype, 'getFirstPage').mockReturnValue([expectedSite0Info, expectedSite1Info])
        getNextPageSpy = jest.spyOn(SiteFinderPaginated.prototype, 'getNextPage').mockReturnValueOnce([expectedAnotherSiteInfo]).mockReturnValue(undefined)
        isCacheUpdatedSpy = jest.spyOn(SitesCache, 'isCacheUpdated')
    })

    test('cache must be initiated from the network', async () => {
        expect(SitesCache.cache).toEqual([])
        const cache = await SitesCache.load(credentials, config)
        expect(SitesCache.cache.length).toBe(config.source.length)
        expect(isCacheUpdatedSpy).toHaveReturnedWith(false)
        expect(cache).toStrictEqual(sites)
    })

    test('cache must not be loaded when it is updated', async () => {
        expect(SitesCache.cache).toEqual([])
        await SitesCache.load(credentials, { ...config, cache: [...sites, expectedAnotherSiteInfo] })
        expect(SitesCache.cache.length).toBe(3)
        expect(isCacheUpdatedSpy).toHaveReturnedWith(true)
        expect(SitesCache.cache).toStrictEqual([...sites, expectedAnotherSiteInfo])
    })

    test('cache must be loaded when it is not updated', async () => {
        expect(SitesCache.cache).toEqual([])
        await SitesCache.load(credentials, { source: [{ apiKey: sites[0].apiKey }] })
        expect(SitesCache.cache.length).toBe(1)
        expect(isCacheUpdatedSpy).toHaveReturnedWith(false)
        expect(SitesCache.cache).toStrictEqual([sites[0]])
    })

    test('is cache updated', async () => {
        const configuration = {
            source: [{ apiKey: 'apiKey2' }],
            deploy: [{ apiKey: 'apiKey' }],
            cache: [
                {
                    apiKey: 'apiKey2',
                    baseDomain: 'dev-cdc-toolkit.com',
                    dataCenter: 'eu1',
                    partnerId: 1,
                    partnerName: 'SAP Customer Data Cloud',
                },
                {
                    apiKey: 'apiKey',
                    baseDomain: 'cdc-accelerator.parent.site-group.com',
                    dataCenter: 'eu1',
                    partnerId: 1,
                    partnerName: 'SAP Customer Data Cloud',
                },
            ],
        }
        expect(SitesCache.isCacheUpdated(configuration)).toBeTruthy()
        configuration.source.push({ apiKey: 'new' })
        expect(SitesCache.isCacheUpdated(configuration)).toBeFalsy()
        configuration.source.pop()
        configuration.deploy.push({ apiKey: 'new' })
        expect(SitesCache.isCacheUpdated(configuration)).toBeFalsy()
        configuration.deploy.pop()
        delete configuration.cache
        expect(SitesCache.isCacheUpdated(configuration)).toBeFalsy()
    })

    test('is cache updated with no source', async () => {
        const configuration = {
            deploy: [{ apiKey: 'apiKey' }],
            cache: [
                {
                    apiKey: 'apiKey2',
                    baseDomain: 'dev-cdc-toolkit.com',
                    dataCenter: 'eu1',
                    partnerId: 1,
                    partnerName: 'SAP Customer Data Cloud',
                },
                {
                    apiKey: 'apiKey',
                    baseDomain: 'cdc-accelerator.parent.site-group.com',
                    dataCenter: 'eu1',
                    partnerId: 1,
                    partnerName: 'SAP Customer Data Cloud',
                },
            ],
        }
        expect(SitesCache.isCacheUpdated(configuration)).toBeTruthy()
    })

    test('is cache updated with no configuration', async () => {
        expect(SitesCache.isCacheUpdated({})).toBeFalsy()
    })

    test('is cache updated with no source or deploy', async () => {
        expect(SitesCache.isCacheUpdated({ cache: [] })).toBeTruthy()
    })
})
