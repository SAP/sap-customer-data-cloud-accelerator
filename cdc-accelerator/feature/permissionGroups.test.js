import {
    expectedGigyaResponseOk,
    expectedPermissionGroupsResponse,
    expectedPermissionGroupsResponseAfterRemovingBuiltInGroups,
    expectedGigyaResponseNok,
    expectedPermissionGroupDataWithScope,
    expectedACLFileContent,
} from './test.gigyaResponses.js'
import fs from 'fs'
import axios from 'axios'
import path from 'path'
import { credentials, partnerBaseDirectory, partnerBuildDirectory } from './test.common.js'
import PermissionGroups from './permissionGroups.js'
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
            let spy = jest.spyOn(permissionGroups, 'remove_built_in_permission_groups')
            await permissionGroups.init(partnerBaseDirectory, getSiteInfo)
            const srcDirectory = path.join(partnerBaseDirectory, permissionGroups.getName())
            expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
            expect(spy.mock.calls.length).toBe(1)
            expect(spy).toHaveBeenCalledWith(expectedPermissionGroupsResponse.groups)
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                path.join(srcDirectory, PermissionGroups.PERMISSIONGROUP_FILE_NAME),
                JSON.stringify(expectedPermissionGroupsResponseAfterRemovingBuiltInGroups, null, 4),
            )
        })
        test('get permission groups failed', async () => {
            const getSiteInfo = {
                partnerId: 123123,
            }
            let spy = jest.spyOn(permissionGroups.getAcl(), 'init')
            axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
            await expect(permissionGroups.init(partnerBaseDirectory, getSiteInfo)).rejects.toEqual(new Error(JSON.stringify(expectedGigyaResponseNok)))
            expect(spy.mock.calls.length).toBe(0)
        })
        test('feature directory already exists', async () => {
            const getSiteInfo = {
                partnerId: 123123,
            }
            axios.mockResolvedValueOnce({ data: expectedPermissionGroupsResponse })
            fs.existsSync.mockReturnValue(true)
            await expect(permissionGroups.init(partnerBaseDirectory, getSiteInfo)).rejects.toEqual(
                new Error(
                    `The "${path.join(
                        partnerBaseDirectory,
                        permissionGroups.getName(),
                    )}" directory already exists, to overwrite its contents please use the option "reset" instead of "init"`,
                ),
            )
        })
        test('file write fails', async () => {
            const getSiteInfo = {
                partnerId: 123123,
            }
            let spy = jest.spyOn(permissionGroups.getAcl(), 'init')
            axios.mockResolvedValueOnce({ data: expectedPermissionGroupsResponse }).mockResolvedValue({ data: expectedGigyaResponseOk })
            fs.existsSync.mockReturnValue(false)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockImplementation(() => {
                throw new Error('File write error')
            })
            await expect(permissionGroups.init(partnerBaseDirectory, getSiteInfo)).rejects.toThrow('File write error')
            expect(spy.mock.calls.length).toBe(0)
        })
    })

    describe('Build test suite', () => {
        test('all permission group files are build successfully', () => {
            const srcFileContent = JSON.stringify(expectedPermissionGroupsResponse.groups)
            const aclName = Object.keys(expectedACLFileContent)
            const dirExists = true
            fs.existsSync.mockReturnValue(dirExists)
            fs.rmSync.mockReturnValue(undefined)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockReturnValue(undefined)
            fs.readFileSync.mockReturnValue(srcFileContent)
            const spy = jest.spyOn(permissionGroups.getAcl(), 'build').mockImplementation(() => {})
            permissionGroups.build(partnerBuildDirectory)
            expect(spy.mock.calls.length).toBe(1)
            const buildFeatureDirectory = path.join(partnerBuildDirectory, permissionGroups.getName())
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

            permissionGroups.reset(partnerBaseDirectory)

            const featureDirectory = path.join(partnerBaseDirectory, permissionGroups.getName())
            expect(fs.existsSync).toHaveBeenCalledWith(featureDirectory)
            if (dirExists) {
                expect(fs.rmSync).toHaveBeenCalledWith(featureDirectory, { force: true, recursive: true })
            } else {
                expect(fs.rmSync).not.toHaveBeenCalled()
            }
        }
    })
    describe('Deploy test suite', () => {
        test('all permission groups were deployed successfully', async () => {
            const permissionGroupsResponse = expectedPermissionGroupDataWithScope
            axios.mockResolvedValue({ data: expectedGigyaResponseOk }).mockResolvedValue({ data: expectedGigyaResponseOk })
            const firstRequestBody = {
                aclID: permissionGroupsResponse.alexTestAdminPermissionGroup.aclID,
                scope: permissionGroupsResponse.alexTestAdminPermissionGroup.scope,
                description: permissionGroupsResponse.alexTestAdminPermissionGroup.description,
            }

            const alexTestAdminPermissionGroup_groupId = 'alexTestAdminPermissionGroup'
            const getSiteInfo = {
                partnerId: 123123,
                dataCenter: 'us1',
            }
            fs.readFileSync.mockReturnValue(JSON.stringify(permissionGroupsResponse))
            let spy = jest.spyOn(permissionGroups, 'deployPermissionGroup')
            const spyAcl = jest.spyOn(permissionGroups.getAcl(), 'deploy').mockImplementation(() => {})
            await permissionGroups.deploy(partnerBuildDirectory, getSiteInfo)
            expect(spy.mock.calls.length).toBe(1)
            expect(spyAcl.mock.calls.length).toBe(1)
            expect(spy).toHaveBeenNthCalledWith(1, getSiteInfo, alexTestAdminPermissionGroup_groupId, firstRequestBody, credentials)
        })
        test('all permission groups should update instead of deploy', async () => {
            axios.mockResolvedValue({ data: expectedGigyaResponseOk }).mockResolvedValue({ data: expectedGigyaResponseOk })
            const getSiteInfo = {
                partnerId: 123123,
                dataCenter: 'us1',
            }
            const permissionGroupsResponse = expectedPermissionGroupsResponseAfterRemovingBuiltInGroups

            const alexTestAdminPermissionGroup_groupId = 'alexTestAdminPermissionGroup'
            const cdc_toolbox_e2e_test_groupId = 'cdc_toolbox_e2e_test'
            const firstRequestBody = {
                aclID: permissionGroupsResponse.alexTestAdminPermissionGroup.aclID,
                description: permissionGroupsResponse.alexTestAdminPermissionGroup.description,
            }
            const secondRequestBody = {
                aclID: permissionGroupsResponse.cdc_toolbox_e2e_test.aclID,
                description: permissionGroupsResponse.cdc_toolbox_e2e_test.description,
            }
            fs.readFileSync.mockReturnValue(JSON.stringify(permissionGroupsResponse))
            let spy = jest.spyOn(permissionGroups, 'updatePermissionGroup')
            const spyAcl = jest.spyOn(permissionGroups.getAcl(), 'deploy').mockImplementation(() => {})
            await permissionGroups.deploy(partnerBuildDirectory, getSiteInfo)
            expect(spy.mock.calls.length).toBe(2)
            expect(spyAcl.mock.calls.length).toBe(1)
            expect(spy).toHaveBeenNthCalledWith(1, getSiteInfo, alexTestAdminPermissionGroup_groupId, firstRequestBody, credentials)
            expect(spy).toHaveBeenNthCalledWith(2, getSiteInfo, cdc_toolbox_e2e_test_groupId, secondRequestBody, credentials)
        })
        test('all permission groups were not deployed unsuccessfully', async () => {
            const getSiteInfo = {
                partnerId: 123123,
                dataCenter: 'us1',
            }
            axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok }).mockResolvedValueOnce({ data: expectedGigyaResponseNok })
            fs.readFileSync.mockReturnValue(true)
            await expect(permissionGroups.deploy(partnerBuildDirectory, getSiteInfo)).rejects.toThrow(Error)
        })
    })
})
