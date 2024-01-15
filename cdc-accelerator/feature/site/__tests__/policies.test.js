import { getSiteConfig, expectedGigyaResponseNok, expectedPoliciesResponse, expectedGigyaResponseOk } from '../../__tests__/test.gigyaResponses.js'
import fs from 'fs'
import path from 'path'
import Policies from '../policies.js'
import { SRC_DIRECTORY, BUILD_DIRECTORY } from '../../../core/constants.js'
import axios from 'axios'
import ToolkitPolicyOptions from '../../../sap-cdc-toolkit/copyConfig/policies/policyOptions.js'
import { credentials, apiKey, srcSiteDirectory } from '../../__tests__/test.common.js'

jest.mock('fs')
jest.mock('axios')

describe('Policies test suite', () => {
    const policies = new Policies(credentials)

    describe('Init policies test suite', () => {
        test('policies file does not contain unwanted fields', async () => {
            const cloneWithoutEmailTemplates = function (original) {
                const cloned = JSON.parse(JSON.stringify(original))
                delete cloned.emailVerification.emailTemplates
                delete cloned.doubleOptIn.emailTemplates
                delete cloned.passwordReset.emailTemplates
                delete cloned.twoFactorAuth.emailProvider.emailTemplates
                delete cloned.preferencesCenter.emailTemplates
                delete cloned.codeVerification.emailTemplates
                delete cloned.doubleOptIn.confirmationEmailTemplates
                delete cloned.statusCode
                delete cloned.errorCode
                delete cloned.statusReason
                delete cloned.callId
                delete cloned.time
                delete cloned.emailNotifications.accountDeletedEmailTemplates
                delete cloned.emailNotifications.welcomeEmailTemplates
                delete cloned.emailNotifications.confirmationEmailTemplates
                return cloned
            }
            axios.mockResolvedValueOnce({ data: expectedPoliciesResponse })

            await policies.init(apiKey, getSiteConfig, srcSiteDirectory)

            const expectedOutput = cloneWithoutEmailTemplates(expectedPoliciesResponse)
            const expectedPath = path.join(srcSiteDirectory, policies.getName(), Policies.POLICIES_FILE_NAME)

            expect(fs.writeFileSync).toHaveBeenCalledWith(expectedPath, JSON.stringify(expectedOutput, null, 4))
        })

        test('get policies failed', async () => {
            axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
            await expect(policies.init(apiKey, getSiteConfig, srcSiteDirectory)).rejects.toEqual(new Error(JSON.stringify(expectedGigyaResponseNok)))
        })

        test('feature directory already exists', async () => {
            axios.mockResolvedValueOnce({ data: expectedPoliciesResponse })
            fs.existsSync.mockReturnValue(true)
            await expect(policies.init(apiKey, getSiteConfig, srcSiteDirectory, false)).rejects.toEqual(
                new Error(
                    `The "${path.join(srcSiteDirectory, policies.getName())}" directory already exists, to overwrite its contents please use the option "reset" instead of "init"`,
                ),
            )
        })

        test('file write fails', async () => {
            axios.mockResolvedValueOnce({ data: expectedGigyaResponseOk })
            fs.existsSync.mockReturnValue(false)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockImplementation(() => {
                throw new Error('File write error')
            })
            await expect(policies.init(apiKey, getSiteConfig, srcSiteDirectory)).rejects.toThrow('File write error')
        })
    })

    describe('Build policies test suite', () => {
        test('policies are built successfully', () => {
            const srcFileContent = JSON.stringify({
                requireCaptcha: false,
                requireSecurityQuestion: false,
                requireLoginID: false,
                enforceCoppa: false,
            })
            const buildDirectory = path.join(srcSiteDirectory.replace(SRC_DIRECTORY, BUILD_DIRECTORY), policies.getName())
            const dirExists = true
            fs.existsSync.mockReturnValue(dirExists)
            fs.rmSync.mockReturnValue(undefined)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockReturnValue(undefined)
            fs.readFileSync.mockReturnValue(srcFileContent)

            policies.build(srcSiteDirectory.replace(SRC_DIRECTORY, BUILD_DIRECTORY))

            expect(fs.existsSync).toHaveBeenCalledWith(buildDirectory)
            if (dirExists) {
                expect(fs.rmSync).toHaveBeenCalledWith(buildDirectory, { force: true, recursive: true })
            }
            expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(buildDirectory, Policies.POLICIES_FILE_NAME), JSON.stringify(expectedPoliciesResponse.registration, null, 4))
        })
    })

    describe('Deploy Policies test suite', () => {
        test('all Policies files are deployed successfully', async () => {
            axios.mockResolvedValue({ data: expectedGigyaResponseOk })
            const srcFileContent = JSON.stringify({ data: 'Testing' })
            fs.readFileSync.mockReturnValue(srcFileContent)
            let spy = jest.spyOn(policies, 'deployUsingToolkit')
            await policies.deploy(apiKey, getSiteConfig, srcSiteDirectory)
            expect(spy.mock.calls.length).toBe(1)
            expect(spy).toHaveBeenNthCalledWith(1, apiKey, getSiteConfig, JSON.parse(srcFileContent), new ToolkitPolicyOptions())
        })
        test('Deploy errorCode response', async () => {
            axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
            const srcFileContent = JSON.stringify(expectedPoliciesResponse)
            fs.readFileSync.mockReturnValue(srcFileContent)
            await expect(policies.deploy(apiKey, getSiteConfig, srcSiteDirectory, false)).rejects.toEqual(new Error(JSON.stringify(expectedGigyaResponseNok)))
        })
    })

    describe('Reset Policies test suite', () => {
        beforeEach(() => {
            jest.clearAllMocks()
        })

        test('reset with existing folder', () => {
            testReset(true)
        })

        test('reset with non-existing folder', () => {
            testReset(false)
        })

        function testReset(dirExists) {
            fs.existsSync.mockReturnValue(dirExists)
            fs.rmSync.mockReturnValue(undefined)

            policies.reset(srcSiteDirectory)

            const featureDirectory = path.join(srcSiteDirectory, policies.getName())
            expect(fs.existsSync).toHaveBeenCalledWith(featureDirectory)
            if (dirExists) {
                expect(fs.rmSync).toHaveBeenCalledWith(featureDirectory, { force: true, recursive: true })
            } else {
                expect(fs.rmSync).not.toHaveBeenCalled()
            }
        }
    })
})
