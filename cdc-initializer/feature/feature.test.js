import { expectedGigyaResponseNok, getSiteConfig } from '../init/testCommon'
import fs from 'fs'
import axios from 'axios'
import Feature from './feature'

jest.mock('axios')
jest.mock('fs')

const credentials = {
    userKey: 'userKey',
    secret: 'secret',
}
const feature = new Feature(credentials)
const sites = [
    { apiKey: '4_Ch-q_qKrjBJ_-QBEfMPkKA', siteDomain: 'cdc-accelerator.parent.site-group.com' },
    { apiKey: '4_tqmAZeYVLPfPl9SYu_iFxA', siteDomain: 'cdc-accelerator.preferences-center.com' },
]

beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
})

describe('Init test suite', () => {
    const phase = 'init'

    test('Init all features executed successfully', async () => {
        const spyesTotalCalls = await executeTestAndCountCalls(phase, undefined)
        expect(spyesTotalCalls).toBe(feature.getFeatures().length * sites.length)
    })

    test('Init schema feature executed successfully', async () => {
        const spyesTotalCalls = await executeTestAndCountCalls(phase, 'Schema')
        expect(spyesTotalCalls).toBe(1 * sites.length)
    })

    test('Init websdk feature executed successfully', async () => {
        const spyesTotalCalls = await executeTestAndCountCalls(phase, 'WebSdk')
        expect(spyesTotalCalls).toBe(1 * sites.length)
    })

    test('Init policies feature executed successfully', async () => {
        const spyesTotalCalls = await executeTestAndCountCalls(phase, 'Policies')
        expect(spyesTotalCalls).toBe(1 * sites.length)
    })

    test('Init all features with no sites', async () => {
        await expect(feature.init([], undefined, undefined)).rejects.toThrow(Error)
        await expect(feature.init(undefined, undefined, undefined)).rejects.toThrow('No source sites to use.')
    })

    test('Error getting site configuration', async () => {
        axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
        fs.existsSync.mockReturnValue(false)
        fs.mkdirSync.mockReturnValue(undefined)
        await expect(feature.init(sites, undefined, undefined)).rejects.toThrow(Error)
    })
})

describe('Reset test suite', () => {
    const phase = 'reset'

    test('Reset all features executed successfully', async () => {
        jest.spyOn(feature, 'resetConfirmation').mockImplementationOnce(() => {
            return true
        })

        const spyesTotalCalls = await executeTestAndCountCalls(phase, undefined)
        expect(spyesTotalCalls).toBe(feature.getFeatures().length * sites.length)
    })

    test('Reset single feature executed successfully', async () => {
        jest.spyOn(feature, 'resetConfirmation').mockImplementationOnce(() => {
            return true
        })

        const spyesTotalCalls = await executeTestAndCountCalls(phase, 'schema')
        expect(spyesTotalCalls).toBe(1 * sites.length)
    })

    test('Execute reset rejected by the user', async () => {
        await executeResetTest(false)
    })

    test('Execute reset successfully', async () => {
        await executeResetTest(true)
    })

    async function executeResetTest(resetUserResponse) {
        jest.spyOn(feature, 'resetConfirmation').mockImplementationOnce(() => {
            return resetUserResponse
        })
        const spyReset = jest.spyOn(feature, 'reset')
        const spyInit = jest.spyOn(feature, 'init')
        await feature.execute('reset', sites, undefined)
        expect(spyReset.mock.calls.length).toBe(1)
        expect(spyInit.mock.calls.length).toBe(resetUserResponse ? 1 : 0)
    }
})

async function executeTestAndCountCalls(phase, featureName) {
    let spyesTotalCalls = 0
    axios.mockResolvedValueOnce({ data: getSiteConfig })

    fs.existsSync.mockReturnValue(true)
    fs.mkdirSync.mockReturnValue(undefined)
    fs.writeFileSync.mockReturnValue(undefined)

    const spies = spyAllFeaturesMethod('init')
    const result = await feature.execute(phase, sites, featureName, undefined)
    expect(result).toBeTruthy()
    for (const spy of spies) {
        if (!featureName || (spy.mock.instances.length > 0 && Feature.isEqualCaseInsensitive(spy.mock.instances[0].constructor.name, featureName))) {
            expect(spy.mock.calls.length).toBe(1 * sites.length)
            spyesTotalCalls += spy.mock.calls.length
        } else {
            expect(spy.mock.calls.length).toBe(0)
        }
    }
    return spyesTotalCalls
}

function spyAllFeaturesMethod(method) {
    const spies = []
    for (const f of feature.getFeatures()) {
        spies.push(jest.spyOn(f, method).mockImplementation(() => {}))
    }
    return spies
}
