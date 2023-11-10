import { expectedGigyaResponseNok, expectedGigyaResponseOk, expectedPermissionGroupsResponse } from './test.gigyaResponses.js'
import fs from 'fs'
import axios from 'axios'
import path from 'path'
import { credentials, partnerBaseDirector, partnerBuildDirector } from './test.common.js'
import PermissionGroups from './permissionGroups.js'
import ACL from './acl.js'

jest.mock('axios')
jest.mock('fs')

describe('Permission Groups test suite', () => {
    const permissionGroups = new PermissionGroups(credentials)
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Init test suit', () => {
        test('All permission groups files are generated sucessfully', async () => {
            axios.mockResolvedValue({ data: expectedPermissionGroupsResponse })
            const getSiteInfo = {
                partnerId: 123123,
                dataCenter: 'eu1',
            }
            fs.existsSync.mockReturnValue(false)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockReturnValue(undefined)
            await permissionGroups.init(partnerBaseDirector, getSiteInfo)
            const srcDirectory = path.join(partnerBaseDirector, permissionGroups.getName())
            expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                path.join(srcDirectory, PermissionGroups.PERMISSIONGROUP_FILE_NAME),
                JSON.stringify(expectedPermissionGroupsResponse.groups, null, 4),
            )
        })
        test('get permission groups failed', async () => {
            const getSiteInfo = {
                partnerId: 123123,
            }
            axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
            await expect(permissionGroups.init(partnerBaseDirector, getSiteInfo)).rejects.toEqual(new Error(JSON.stringify(expectedGigyaResponseNok)))
        })
        test('feature directory already exists', async () => {
            const getSiteInfo = {
                partnerId: 123123,
            }
            axios.mockResolvedValueOnce({ data: expectedPermissionGroupsResponse })
            fs.existsSync.mockReturnValue(true)
            await expect(permissionGroups.init(partnerBaseDirector, getSiteInfo)).rejects.toEqual(
                new Error(
                    `The "${path.join(
                        partnerBaseDirector,
                        permissionGroups.getName(),
                    )}" directory already exists, to overwrite its contents please use the option "reset" instead of "init"`,
                ),
            )
        })
        test('file write fails', async () => {
            const getSiteInfo = {
                partnerId: 123123,
            }
            axios.mockResolvedValueOnce({ data: expectedPermissionGroupsResponse }).mockResolvedValue({ data: expectedGigyaResponseOk })
            fs.existsSync.mockReturnValue(false)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockImplementation(() => {
                throw new Error('File write error')
            })
            await expect(permissionGroups.init(partnerBaseDirector, getSiteInfo)).rejects.toThrow('File write error')
        })
        test('ACL Init should not be called', async () => {
            axios.mockResolvedValue({ data: expectedGigyaResponseNok })
            const getSiteInfo = {
                partnerId: 123123,
                dataCenter: 'eu1',
            }
            let spy = jest.spyOn(await permissionGroups.getAcl(), 'init')
            await expect(permissionGroups.init(partnerBaseDirector, getSiteInfo)).rejects.toThrow(new Error(JSON.stringify(expectedGigyaResponseNok)))
            expect(spy.mock.calls.length).toBe(0)
        })
    })
    describe('Build test suite', () => {
        test('all permission group files are build successfully', () => {
            const srcFileContent = JSON.stringify(expectedPermissionGroupsResponse.groups)
            const dirExists = true
            fs.existsSync.mockReturnValue(dirExists)
            fs.rmSync.mockReturnValue(undefined)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockReturnValue(undefined)
            fs.readFileSync.mockReturnValue(srcFileContent)
            permissionGroups.build(partnerBuildDirector)
            const buildFeatureDirectory = path.join(partnerBuildDirector, permissionGroups.getName())
            expect(fs.existsSync).toHaveBeenCalledWith(buildFeatureDirectory)
            if (dirExists) {
                expect(fs.rmSync).toHaveBeenCalledWith(buildFeatureDirectory, { force: true, recursive: true })
            }
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                path.join(buildFeatureDirectory, `${permissionGroups.getName()}.json`),
                JSON.stringify(JSON.parse(srcFileContent), null, 4),
            )
        })
    })
    describe('Reset test suite', () => {
        test('reset with existing folder', () => {
            testReset(true)
        })

        test('reset with non-existing folder', () => {
            testReset(false)
        })

        function testReset(dirExists) {
            fs.existsSync.mockReturnValue(dirExists)
            fs.rmSync.mockReturnValue(undefined)

            permissionGroups.reset(partnerBaseDirector)

            const featureDirectory = path.join(partnerBaseDirector, permissionGroups.getName())
            expect(fs.existsSync).toHaveBeenCalledWith(featureDirectory)
            if (dirExists) {
                expect(fs.rmSync).toHaveBeenCalledWith(featureDirectory, { force: true, recursive: true })
            } else {
                expect(fs.rmSync).not.toHaveBeenCalled()
            }
        }
    })
})
