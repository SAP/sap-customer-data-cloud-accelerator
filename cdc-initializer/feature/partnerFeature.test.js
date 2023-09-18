import PartnerFeature from './partnerFeature'

jest.mock('axios')
jest.mock('fs')

describe('Partner features test suite', () => {
    const operation = 'init'

    test('Init all features executed successfully', async () => {
        //const spyesTotalCalls = await executeTestAndCountCalls(operation, undefined)
        //expect(spyesTotalCalls).toBe(feature.getFeatures().length * sites.length)
    })
})

function registerAllFeatures() {
    //    feature.register(new PermissionGroups(credentials))
}
