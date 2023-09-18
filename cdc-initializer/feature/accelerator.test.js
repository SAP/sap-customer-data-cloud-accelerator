import { sites } from './test.common'
import { acceleratorCommonTests, accelerator, siteFeatures, partnerFeatures } from './accelerator.common.test.js'

describe('Accelerator test suite', () => {
    beforeEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()
    })

    describe('Reset test suite', () => {
        let operation = 'reset'

        test(`${operation} all features executed successfully`, async () => {
            jest.spyOn(accelerator, 'resetConfirmation').mockImplementationOnce(() => {
                return true
            })
            const siteFeatureResetSpy = jest.spyOn(siteFeatures, operation).mockImplementation(async () => {
                return true
            })
            const partnerFeatureResetSpy = jest.spyOn(partnerFeatures, operation).mockImplementation(async () => {
                return true
            })
            const siteFeatureInitSpy = jest.spyOn(siteFeatures, 'init').mockImplementation(async () => {
                return true
            })
            const partnerFeatureInitSpy = jest.spyOn(partnerFeatures, 'init').mockImplementation(async () => {
                return true
            })
            const result = await accelerator.execute(operation, sites, undefined, undefined)
            expect(result).toBeTruthy()
            expect(siteFeatureResetSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureResetSpy.mock.calls.length).toBe(1)
            expect(siteFeatureInitSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureInitSpy.mock.calls.length).toBe(1)
        })

        test(`${operation} schema feature executed successfully`, async () => {
            jest.spyOn(accelerator, 'resetConfirmation').mockImplementationOnce(() => {
                return true
            })
            const siteFeatureResetSpy = jest.spyOn(siteFeatures, operation).mockImplementation(async () => {
                return true
            })
            const partnerFeatureResetSpy = jest.spyOn(partnerFeatures, operation).mockImplementation(async () => {
                return true
            })
            const siteFeatureInitSpy = jest.spyOn(siteFeatures, 'init').mockImplementation(async () => {
                return true
            })
            const partnerFeatureInitSpy = jest.spyOn(partnerFeatures, 'init').mockImplementation(async () => {
                return true
            })
            const result = await accelerator.execute(operation, sites, 'schema', undefined)
            expect(result).toBeTruthy()
            expect(siteFeatureResetSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureResetSpy.mock.calls.length).toBe(1)
            expect(siteFeatureInitSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureInitSpy.mock.calls.length).toBe(1)
        })

        test(`${operation} site feature executed unsuccessfully`, async () => {
            jest.spyOn(accelerator, 'resetConfirmation').mockImplementationOnce(() => {
                return true
            })
            const siteFeatureResetSpy = jest.spyOn(siteFeatures, operation).mockImplementation(async () => {
                throw new Error('')
            })
            const partnerFeatureResetSpy = jest.spyOn(partnerFeatures, operation).mockImplementation(async () => {
                return true
            })
            const siteFeatureInitSpy = jest.spyOn(siteFeatures, 'init').mockImplementation(async () => {
                return true
            })
            const partnerFeatureInitSpy = jest.spyOn(partnerFeatures, 'init').mockImplementation(async () => {
                return true
            })
            const result = await accelerator.execute(operation, [], undefined, undefined)
            expect(result).toBeFalsy()
            expect(siteFeatureResetSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureResetSpy.mock.calls.length).toBe(0)
            expect(siteFeatureInitSpy.mock.calls.length).toBe(0)
            expect(partnerFeatureInitSpy.mock.calls.length).toBe(0)
        })

        test(`${operation} partner feature executed unsuccessfully`, async () => {
            jest.spyOn(accelerator, 'resetConfirmation').mockImplementationOnce(() => {
                return true
            })
            const siteFeatureResetSpy = jest.spyOn(siteFeatures, operation).mockImplementation(async () => {
                return true
            })
            const partnerFeatureResetSpy = jest.spyOn(partnerFeatures, operation).mockImplementation(async () => {
                throw new Error('')
            })
            const siteFeatureInitSpy = jest.spyOn(siteFeatures, 'init').mockImplementation(async () => {
                return true
            })
            const partnerFeatureInitSpy = jest.spyOn(partnerFeatures, 'init').mockImplementation(async () => {
                return true
            })
            const result = await accelerator.execute(operation, [], undefined, undefined)
            expect(result).toBeFalsy()
            expect(siteFeatureResetSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureResetSpy.mock.calls.length).toBe(1)
            expect(siteFeatureInitSpy.mock.calls.length).toBe(0)
            expect(partnerFeatureInitSpy.mock.calls.length).toBe(0)
        })

        test(`${operation} then init site feature executed unsuccessfully`, async () => {
            jest.spyOn(accelerator, 'resetConfirmation').mockImplementationOnce(() => {
                return true
            })
            const siteFeatureResetSpy = jest.spyOn(siteFeatures, operation).mockImplementation(async () => {
                return true
            })
            const partnerFeatureResetSpy = jest.spyOn(partnerFeatures, operation).mockImplementation(async () => {
                return true
            })
            const siteFeatureInitSpy = jest.spyOn(siteFeatures, 'init').mockImplementation(async () => {
                throw new Error('')
            })
            const partnerFeatureInitSpy = jest.spyOn(partnerFeatures, 'init').mockImplementation(async () => {
                return true
            })
            const result = await accelerator.execute(operation, sites, undefined, undefined)
            expect(result).toBeFalsy()
            expect(siteFeatureResetSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureResetSpy.mock.calls.length).toBe(1)
            expect(siteFeatureInitSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureInitSpy.mock.calls.length).toBe(0)
        })

        test(`${operation} then init partner feature executed unsuccessfully`, async () => {
            jest.spyOn(accelerator, 'resetConfirmation').mockImplementationOnce(() => {
                return true
            })
            const siteFeatureResetSpy = jest.spyOn(siteFeatures, operation).mockImplementation(async () => {
                return true
            })
            const partnerFeatureResetSpy = jest.spyOn(partnerFeatures, operation).mockImplementation(async () => {
                return true
            })
            const siteFeatureInitSpy = jest.spyOn(siteFeatures, 'init').mockImplementation(async () => {
                return true
            })
            const partnerFeatureInitSpy = jest.spyOn(partnerFeatures, 'init').mockImplementation(async () => {
                throw new Error('')
            })
            const result = await accelerator.execute(operation, sites, undefined, undefined)
            expect(result).toBeFalsy()
            expect(siteFeatureResetSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureResetSpy.mock.calls.length).toBe(1)
            expect(siteFeatureInitSpy.mock.calls.length).toBe(1)
            expect(partnerFeatureInitSpy.mock.calls.length).toBe(1)
        })

        test(`${operation} cancelled by user`, async () => {
            jest.spyOn(accelerator, 'resetConfirmation').mockImplementationOnce(() => {
                return false
            })
            const siteFeatureResetSpy = jest.spyOn(siteFeatures, operation).mockImplementation(async () => {
                return true
            })
            const partnerFeatureResetSpy = jest.spyOn(partnerFeatures, operation).mockImplementation(async () => {
                return true
            })
            const siteFeatureInitSpy = jest.spyOn(siteFeatures, 'init').mockImplementation(async () => {
                return true
            })
            const partnerFeatureInitSpy = jest.spyOn(partnerFeatures, 'init').mockImplementation(async () => {
                return true
            })
            const result = await accelerator.execute(operation, sites, undefined, undefined)
            expect(result).toBeTruthy()
            expect(siteFeatureResetSpy.mock.calls.length).toBe(0)
            expect(partnerFeatureResetSpy.mock.calls.length).toBe(0)
            expect(siteFeatureInitSpy.mock.calls.length).toBe(0)
            expect(partnerFeatureInitSpy.mock.calls.length).toBe(0)
        })
    })

    describe('Other operations test suite', () => {
        acceleratorCommonTests('init')
        acceleratorCommonTests('build')
        acceleratorCommonTests('deploy')

        let operation = 'unknown'
        test(`${operation} operation not exists`, async () => {
            const result = await accelerator.execute(operation, sites, undefined, undefined)
            expect(result).toBeFalsy()
        })
    })
})
