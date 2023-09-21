import Accelerator from './accelerator.js'
import { getPartnerFeature, getSiteFeature, sites } from './test.common.js'
import { Operations } from './constants.js'

export const siteFeatures = getSiteFeature()
export const partnerFeatures = getPartnerFeature()
export let accelerator = new Accelerator(siteFeatures, partnerFeatures)

export const acceleratorCommonTests = (operation) => {
    describe(`Accelerator common tests for ${operation}`, () => {
        test(`${operation} all features executed successfully`, async () => {
            const siteFeatureSpy = jest.spyOn(siteFeatures, operation).mockImplementation(async () => {
                return true
            })
            const partnerFeatureSpy = jest.spyOn(partnerFeatures, operation).mockImplementation(async () => {
                return true
            })
            const result = await accelerator.execute(operation, sites, undefined, undefined)
            expect(result).toBeTruthy()
            expect(siteFeatureSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureSpy.mock.calls.length).toBe(1)
        })

        test(`${operation} partner feature executed unsuccessfully`, async () => {
            const siteFeatureSpy = jest.spyOn(siteFeatures, operation).mockImplementation(async () => {
                return true
            })
            const partnerFeatureSpy = jest.spyOn(partnerFeatures, operation).mockImplementation(async () => {
                throw new Error('')
            })
            const result = await accelerator.execute(operation, sites, undefined, undefined)
            expect(result).toBeFalsy()
            expect(siteFeatureSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureSpy.mock.calls.length).toBe(1)
        })

        test(`${operation} site feature executed unsuccessfully`, async () => {
            const siteFeatureSpy = jest.spyOn(siteFeatures, operation).mockImplementation(async () => {
                throw new Error('')
            })
            const partnerFeatureSpy = jest.spyOn(partnerFeatures, operation).mockImplementation(async () => {
                return true
            })
            const result = await accelerator.execute(operation, sites, undefined, undefined)
            expect(result).toBeFalsy()
            expect(siteFeatureSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureSpy.mock.calls.length).toBe(0)
        })

        test(`${operation} all features with no sites`, async () => {
            if (operation === Operations.build) {
                return
            }
            const siteFeatureSpy = jest.spyOn(siteFeatures, operation).mockImplementation(async () => {
                return true
            })
            const partnerFeatureSpy = jest.spyOn(partnerFeatures, operation).mockImplementation(async () => {
                return true
            })
            const result = await accelerator.execute(operation, [], undefined, undefined)
            expect(result).toBeFalsy()
            expect(siteFeatureSpy.mock.calls.length).toBe(0)
            expect(partnerFeatureSpy.mock.calls.length).toBe(0)
        })

        test(`${operation} site feature executed successfully`, async () => {
            const siteFeatureSpy = jest.spyOn(siteFeatures, operation).mockImplementation(async () => {
                return true
            })
            const partnerFeatureSpy = jest.spyOn(partnerFeatures, operation).mockImplementation(async () => {
                return true
            })
            const result = await accelerator.execute(operation, sites, siteFeatures.getFeatures()[0].constructor.name, undefined)
            expect(result).toBeTruthy()
            expect(siteFeatureSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureSpy.mock.calls.length).toBe(0)
        })

        test(`${operation} parent feature executed successfully`, async () => {
            const siteFeatureSpy = jest.spyOn(siteFeatures, operation).mockImplementation(async () => {
                return true
            })
            const partnerFeatureSpy = jest.spyOn(partnerFeatures, operation).mockImplementation(async () => {
                return true
            })
            const result = await accelerator.execute(operation, sites, partnerFeatures.getFeatures()[0].constructor.name, undefined)
            expect(result).toBeTruthy()
            expect(siteFeatureSpy.mock.calls.length).toBe(0)
            expect(partnerFeatureSpy.mock.calls.length).toBe(1)
        })
    })
}

// just to avoid warning, that no tests in test file
describe.skip('Common tests for accelerator', () => {
    test('dummy', () => {})
})
