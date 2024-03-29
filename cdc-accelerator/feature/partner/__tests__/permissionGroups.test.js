import {
    expectedGigyaResponseOk,
    expectedPermissionGroupsResponse,
    expectedPermissionGroupsResponseAfterRemovingBuiltInGroups,
    expectedGigyaResponseNok,
    expectedACLFileContent,
    expectedPermissionGroupsResponseWithEmptyGroup,
} from '../../__tests__/test.gigyaResponses.js'
import fs from 'fs'
import axios from 'axios'
import path from 'path'
import { credentials, partnerBaseDirectory, partnerBuildDirectory } from '../../__tests__/test.common.js'
import PermissionGroups from '../permissionGroups.js'

jest.mock('axios')
jest.mock('fs')

describe('Permission Groups test suite', () => {
    const permissionGroups = new PermissionGroups(credentials)
    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()
        jest.restoreAllMocks()
    })

    describe('Init test suit', () => {
        test('All permission groups files are generated sucessfully', async () => {
            axios.mockResolvedValue({ data: expectedPermissionGroupsResponseWithEmptyGroup })
            const getSiteInfo = {
                partnerId: 123123,
                dataCenter: 'eu1',
            }

            fs.existsSync.mockReturnValue(false)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockReturnValue(undefined)
            await permissionGroups.init(partnerBaseDirectory, getSiteInfo)
            const srcDirectory = path.join(partnerBaseDirectory, permissionGroups.getName())
            expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
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
            const permissionGroupsResponse = expectedPermissionGroupsResponseWithEmptyGroup
            axios.mockResolvedValue({ data: expectedGigyaResponseOk }).mockResolvedValueOnce({ data: expectedGigyaResponseOk })
            const firstRequestBody = {
                aclID: permissionGroupsResponse.groups.alexTestAdminPermissionGroup.aclID,
                scope: permissionGroupsResponse.groups.alexTestAdminPermissionGroup.scope,
                description: permissionGroupsResponse.groups.alexTestAdminPermissionGroup.description,
                users: permissionGroupsResponse.groups.alexTestAdminPermissionGroup.users,
            }
            const secondRequestBody = {
                aclID: permissionGroupsResponse.groups.cdc_toolbox_e2e_test.aclID,
                scope: permissionGroupsResponse.groups.cdc_toolbox_e2e_test.scope,
                description: permissionGroupsResponse.groups.cdc_toolbox_e2e_test.description,
                users: permissionGroupsResponse.groups.cdc_toolbox_e2e_test.users,
            }

            const alexTestAdminPermissionGroup_groupId = 'alexTestAdminPermissionGroup'
            const cdc_toolbox_e2e_test_groupId = 'cdc_toolbox_e2e_test'
            const getSiteInfo = {
                partnerId: 123123,
                dataCenter: 'us1',
            }
            fs.readFileSync.mockReturnValue(JSON.stringify(expectedPermissionGroupsResponseWithEmptyGroup.groups))
            let spy = jest.spyOn(permissionGroups, 'deployPermissionGroup')
            const spyAcl = jest.spyOn(permissionGroups.getAcl(), 'deploy').mockImplementation(() => {})
            await permissionGroups.deploy(partnerBuildDirectory, getSiteInfo)
            expect(spy.mock.calls.length).toBe(2)
            expect(spyAcl.mock.calls.length).toBe(1)
            expect(spy).toHaveBeenNthCalledWith(1, getSiteInfo, alexTestAdminPermissionGroup_groupId, firstRequestBody, credentials)
            expect(spy).toHaveBeenNthCalledWith(2, getSiteInfo, cdc_toolbox_e2e_test_groupId, secondRequestBody, credentials)
        })

        test('all permission groups should update instead of deploy', async () => {
            axios.mockResolvedValue({ data: expectedGigyaResponseOk })
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

        test('permission groups file is empty', async () => {
            const getSiteInfo = {
                partnerId: 123123,
                dataCenter: 'us1',
            }
            fs.readFileSync.mockReturnValue(true)
            await expect(permissionGroups.deploy(partnerBuildDirectory, getSiteInfo)).rejects.toThrow(Error)
        })

        test('update permission group that do not exist', async () => {
            const getSiteInfo = {
                partnerId: 123123,
                dataCenter: 'us1',
            }
            const gigyaResponse = Object.assign({}, expectedGigyaResponseNok)
            gigyaResponse.errorCode = 400006
            axios.mockResolvedValueOnce({ data: gigyaResponse })
            fs.readFileSync.mockReturnValue(JSON.stringify({
                "unknownId": {
                    "aclID": "anyId",
                    "description": "Testing new configuration"
                }}))
            await expect(permissionGroups.deploy(partnerBuildDirectory, getSiteInfo)).rejects.toThrow(Error('Permission group unknownId does not exists.'))
        })

        test('update permission group unsuccessfully', async () => {
            const getSiteInfo = {
                partnerId: 123123,
                dataCenter: 'us1',
            }
            axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
            fs.readFileSync.mockReturnValue(JSON.stringify({
                "id": {
                    "aclID": "anyId",
                    "description": "Testing new configuration"
                }}))
            await expect(permissionGroups.deploy(partnerBuildDirectory, getSiteInfo)).rejects.toThrow(Error(JSON.stringify(expectedGigyaResponseNok)))
        })
    })
})
