import { getSiteConfig, expectedGigyaResponseNok, expectedPoliciesResponse } from '../init/testCommon'
import fs from 'fs'
import path from 'path'
import Policies from './policies'
import { SRC_DIRECTORY, BUILD_DIRECTORY } from '../constants'
import axios from 'axios'

jest.mock('fs')
jest.mock('axios')

const credentials = {
    userKey: 'userKey',
    secret: 'secret',
}
const siteDomain = 'domain.test.com'
const apiKey = 'apiKey'
const policies = new Policies(credentials)

describe('Init policies test suite', () => {
    test('policies file is generated successfully', async () => {
        axios.mockResolvedValueOnce({ data: expectedPoliciesResponse })
        fs.existsSync.mockReturnValue(false)
        fs.mkdirSync.mockReturnValue(undefined)
        fs.writeFileSync.mockReturnValue(undefined)
        await policies.init(apiKey, getSiteConfig, siteDomain)
        const srcDirectory = path.join(SRC_DIRECTORY, siteDomain, policies.getName())
        expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
        expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(srcDirectory, Policies.POLICIES_FILE_NAME), JSON.stringify(expectedPoliciesResponse, null, 4))
    })

    test('get policies failed', async () => {
        axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
        await expect(policies.init(apiKey, getSiteConfig, siteDomain)).rejects.toEqual(new Error(JSON.stringify(expectedGigyaResponseNok)))
    })

    test('feature directory already exists', async () => {
        axios.mockResolvedValueOnce({ data: expectedPoliciesResponse })
        fs.existsSync.mockReturnValue(true)
        await expect(policies.init(apiKey, getSiteConfig, siteDomain)).rejects.toEqual(
            new Error(
                `The "${path.join(
                    SRC_DIRECTORY,
                    siteDomain,
                    policies.getName(),
                )}" directory already exists, to overwrite it's contents please use the option "reset" instead of "init"`,
            ),
        )
    })

    test('directory creation fails', async () => {
        axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
        fs.existsSync.mockReturnValue(false)
        fs.mkdirSync.mockImplementation(() => {
            throw new Error('Directory creation error')
        })
        await expect(policies.init(apiKey, getSiteConfig, siteDomain)).rejects.toThrow('Invalid ApiKey parameter')
    })

    test('file write fails', async () => {
        axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
        fs.existsSync.mockReturnValue(false)
        fs.mkdirSync.mockReturnValue(undefined)
        fs.writeFileSync.mockImplementation(() => {
            throw new Error('File write error')
        })
        await expect(policies.init(apiKey, getSiteConfig, siteDomain)).rejects.toThrow('Invalid ApiKey parameter')
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
        const buildDirectory = path.join(BUILD_DIRECTORY, siteDomain, policies.getName())
        const dirExists = true
        fs.existsSync.mockReturnValue(dirExists)
        fs.rmSync.mockReturnValue(undefined)
        fs.mkdirSync.mockReturnValue(undefined)
        fs.writeFileSync.mockReturnValue(undefined)
        fs.readFileSync.mockReturnValue(srcFileContent)

        policies.build(siteDomain)

        expect(fs.existsSync).toHaveBeenCalledWith(buildDirectory)
        if (dirExists) {
            expect(fs.rmSync).toHaveBeenCalledWith(buildDirectory, { force: true, recursive: true })
        }
        expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(buildDirectory, Policies.POLICIES_FILE_NAME), JSON.stringify(expectedPoliciesResponse.registration, null, 4))
    })
})

describe('Deploy Policies test suite', () => {
    test('all Policies files are deployed successfully', async () => {
        const srcFileContent = JSON.stringify({
            registration: {
                enforceCoppa: false,
                requireCaptcha: false,
                requireLoginID: false,
                requireSecurityQuestion: false,
            },
        })

        fs.readFileSync.mockReturnValue(srcFileContent)
        const payload = {
            policies: JSON.parse(srcFileContent),
        }
        let spy = jest.spyOn(policies, 'deploy')
        await policies.deploy(apiKey, getSiteConfig, siteDomain)
        expect(spy.mock.calls.length).toBe(1)
        expect(spy).toHaveBeenNthCalledWith(1, apiKey, getSiteConfig, siteDomain)
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

        policies.reset(siteDomain)

        const featureDirectory = path.join(SRC_DIRECTORY, siteDomain, policies.getName())
        expect(fs.existsSync).toHaveBeenCalledWith(featureDirectory)
        console.log('dirExists', dirExists)
        if (dirExists) {
            expect(fs.rmSync).toHaveBeenCalledWith(featureDirectory, { force: true, recursive: true })
        } else {
            expect(fs.rmSync).not.toHaveBeenCalled()
        }
    }
})
