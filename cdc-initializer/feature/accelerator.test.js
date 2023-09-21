import { sites } from './test.common.js'
import { acceleratorCommonTests, accelerator, siteFeatures, partnerFeatures } from './accelerator.common.test.js'
import { Operations } from './constants.js'

describe('Accelerator test suite', () => {
    const noError = -1
    const resetConfirmation = true
    beforeEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()
    })

    describe('Reset test suite', () => {
        let operation = Operations.reset

        test(`${operation} all features executed successfully`, async () => {
            const { siteFeatureInitSpy, siteFeatureResetSpy, partnerFeatureResetSpy, partnerFeatureInitSpy } = mockResetTypeFeatures(operation, noError, resetConfirmation)

            const result = await accelerator.execute(operation, sites, undefined, undefined)
            expect(result).toBeTruthy()
            expect(siteFeatureResetSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureResetSpy.mock.calls.length).toBe(1)
            expect(siteFeatureInitSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureInitSpy.mock.calls.length).toBe(1)
        })

        test(`${operation} schema feature executed successfully`, async () => {
            const { siteFeatureInitSpy, siteFeatureResetSpy, partnerFeatureResetSpy, partnerFeatureInitSpy } = mockResetTypeFeatures(operation, noError, resetConfirmation)

            const result = await accelerator.execute(operation, sites, 'schema', undefined)
            expect(result).toBeTruthy()
            expect(siteFeatureResetSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureResetSpy.mock.calls.length).toBe(0)
            expect(siteFeatureInitSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureInitSpy.mock.calls.length).toBe(0)
        })

        test(`${operation} site feature executed unsuccessfully`, async () => {
            const { siteFeatureInitSpy, siteFeatureResetSpy, partnerFeatureResetSpy, partnerFeatureInitSpy } = mockResetTypeFeatures(operation, 0, resetConfirmation)

            const result = await accelerator.execute(operation, [], undefined, undefined)
            expect(result).toBeFalsy()
            expect(siteFeatureResetSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureResetSpy.mock.calls.length).toBe(0)
            expect(siteFeatureInitSpy.mock.calls.length).toBe(0)
            expect(partnerFeatureInitSpy.mock.calls.length).toBe(0)
        })

        test(`${operation} partner feature executed unsuccessfully`, async () => {
            const { siteFeatureInitSpy, siteFeatureResetSpy, partnerFeatureResetSpy, partnerFeatureInitSpy } = mockResetTypeFeatures(operation, 1, resetConfirmation)

            const result = await accelerator.execute(operation, [], undefined, undefined)
            expect(result).toBeFalsy()
            expect(siteFeatureResetSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureResetSpy.mock.calls.length).toBe(1)
            expect(siteFeatureInitSpy.mock.calls.length).toBe(0)
            expect(partnerFeatureInitSpy.mock.calls.length).toBe(0)
        })

        test(`${operation} then init site feature executed unsuccessfully`, async () => {
            const { siteFeatureInitSpy, siteFeatureResetSpy, partnerFeatureResetSpy, partnerFeatureInitSpy } = mockResetTypeFeatures(operation, 2, resetConfirmation)

            const result = await accelerator.execute(operation, sites, undefined, undefined)
            expect(result).toBeFalsy()
            expect(siteFeatureResetSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureResetSpy.mock.calls.length).toBe(1)
            expect(siteFeatureInitSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureInitSpy.mock.calls.length).toBe(0)
        })

        test(`${operation} then init partner feature executed unsuccessfully`, async () => {
            const { siteFeatureInitSpy, siteFeatureResetSpy, partnerFeatureResetSpy, partnerFeatureInitSpy } = mockResetTypeFeatures(operation, 3, resetConfirmation)

            const result = await accelerator.execute(operation, sites, undefined, undefined)
            expect(result).toBeFalsy()
            expect(siteFeatureResetSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureResetSpy.mock.calls.length).toBe(1)
            expect(siteFeatureInitSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureInitSpy.mock.calls.length).toBe(1)
        })

        test(`${operation} cancelled by user`, async () => {
            const { siteFeatureInitSpy, siteFeatureResetSpy, partnerFeatureResetSpy, partnerFeatureInitSpy } = mockResetTypeFeatures(operation, noError, !resetConfirmation)

            const result = await accelerator.execute(operation, sites, undefined, undefined)
            expect(result).toBeTruthy()
            expect(siteFeatureResetSpy.mock.calls.length).toBe(0)
            expect(partnerFeatureResetSpy.mock.calls.length).toBe(0)
            expect(siteFeatureInitSpy.mock.calls.length).toBe(0)
            expect(partnerFeatureInitSpy.mock.calls.length).toBe(0)
        })
    })

    describe('Other operations test suite', () => {
        acceleratorCommonTests(Operations.init)
        acceleratorCommonTests(Operations.build)
        acceleratorCommonTests(Operations.deploy)

        let operation = 'unknown'
        test(`${operation} operation not exists`, async () => {
            const result = await accelerator.execute(operation, sites, undefined, undefined)
            expect(result).toBeFalsy()
        })
    })

    function mockResetTypeFeatures(operation, errorIndex, resetConfirmation) {
        jest.spyOn(accelerator, 'resetConfirmation').mockImplementationOnce(() => {
            return resetConfirmation
        })
        const siteFeatureResetSpy = jest.spyOn(siteFeatures, operation).mockImplementation(async () => {
            return implementMock(errorIndex, 0)
        })
        const partnerFeatureResetSpy = jest.spyOn(partnerFeatures, operation).mockImplementation(async () => {
            return implementMock(errorIndex, 1)
        })
        const siteFeatureInitSpy = jest.spyOn(siteFeatures, Operations.init).mockImplementation(async () => {
            return implementMock(errorIndex, 2)
        })
        const partnerFeatureInitSpy = jest.spyOn(partnerFeatures, Operations.init).mockImplementation(async () => {
            return implementMock(errorIndex, 3)
        })
        return { siteFeatureInitSpy, siteFeatureResetSpy, partnerFeatureResetSpy, partnerFeatureInitSpy }
    }

    function implementMock(errorIndex, myIndex) {
        if (errorIndex === myIndex) {
            throw new Error('')
        }
        return true
    }
})
