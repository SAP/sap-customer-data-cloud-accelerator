import Configuration from './configuration.js'
import { config, credentials, sites } from './test.common.js'
import SitesCache from './sitesCache.js'
import { CONFIG_FILENAME, Operations } from './constants.js'
import fs from 'fs'

jest.mock('fs')

describe('Configuration test suite', () => {
    test('generate cache successfully', async () => {
        const cache = [sites[0], sites[1]]
        jest.spyOn(SitesCache, 'load').mockImplementation(() => {
            return cache
        })
        fs.readFileSync.mockReturnValue(JSON.stringify(config))
        await Configuration.generateCache(credentials)
        const expectedConfig = config
        expectedConfig['cache'] = cache
        expect(fs.writeFileSync).toHaveBeenCalledWith(CONFIG_FILENAME, JSON.stringify(expectedConfig, null, 4))
    })

    test('generate cache unsuccessfully', async () => {
        const cache = []
        jest.spyOn(SitesCache, 'load').mockImplementation(() => {
            return cache
        })
        fs.readFileSync.mockReturnValue(JSON.stringify(config))
        await expect(async () => Configuration.generateCache(credentials)).rejects.toThrow(Error)
    })

    test('get sites successfully', async () => {
        jest.spyOn(SitesCache, 'getSiteInfo').mockReturnValueOnce(sites[0]).mockReturnValueOnce(sites[1])
        fs.readFileSync.mockReturnValue(JSON.stringify(config))
        const sitesInfo = Configuration.getSites(Operations.init, 'dev')
        expect(sitesInfo.length).toEqual(config.source.length)
    })
})
