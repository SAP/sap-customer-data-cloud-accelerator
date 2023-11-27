import ACL from '../acl.js'
import fs from 'fs'
import axios from 'axios'
import path from 'path'
import { expectedGigyaResponseNok, expectedGigyaResponseOk, expectedAclResponse, expectedPermissionGroupsResponse, expectedACLFileContent } from '../../test.gigyaResponses.js'
import { credentials, partnerBuildDirectory, partnerBaseDirectory } from '../../test.common.js'
jest.mock('axios')
jest.mock('fs')

describe('ACLs test suite', () => {
    const acls = new ACL(credentials)
    const permissionGroupDirectoryName = 'PermissionGroups'
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Init test suit', () => {
        test('All ACL files are generated sucessfully', async () => {
            const aclIDs = Object.keys(expectedPermissionGroupsResponse.groups).map((key) => expectedPermissionGroupsResponse.groups[key].aclID)
            axios.mockResolvedValue({ data: expectedAclResponse })
            const getSiteInfo = {
                partnerId: 123123,
                dataCenter: 'eu1',
            }
            fs.existsSync.mockReturnValue(false)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockReturnValue(undefined)
            const srcDirectory = path.join(partnerBaseDirectory, acls.getName())
            await acls.init(aclIDs, getSiteInfo.partnerId, partnerBaseDirectory, getSiteInfo.dataCenter)
            expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
            expect(fs.writeFileSync.mock.calls.length).toBe(2)
            expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(srcDirectory, `${aclIDs[0]}.json`), JSON.stringify(expectedAclResponse.acl, null, 4))
            expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(srcDirectory, `${aclIDs[1]}.json`), JSON.stringify(expectedAclResponse.acl, null, 4))
        })
        test('get ACLs failed', async () => {
            const aclIDs = Object.keys(expectedPermissionGroupsResponse.groups).map((key) => expectedPermissionGroupsResponse.groups[key].aclID)
            axios.mockResolvedValue({ data: expectedGigyaResponseNok })
            const getSiteInfo = {
                partnerId: 123123,
                dataCenter: 'eu1',
            }
            fs.readFileSync.mockReturnValue(true)
            const srcDirectory = path.join(partnerBaseDirectory, permissionGroupDirectoryName)
            await expect(acls.init(aclIDs, getSiteInfo.partnerId, srcDirectory, getSiteInfo.dataCenter)).rejects.toThrow(new Error(JSON.stringify(expectedGigyaResponseNok)))
        })
    })
    describe('Build test suit', () => {
        test('All ACL files are built successfully', async () => {
            const srcFileContent = JSON.stringify(expectedAclResponse.acl)
            const aclName = Object.keys(expectedACLFileContent)
            const buildPermissionGroupDirectory = path.join(partnerBuildDirectory, permissionGroupDirectoryName)
            const dirExists = true
            fs.existsSync.mockReturnValue(dirExists)
            fs.readdirSync.mockReturnValue([`${aclName[0]}.json`, `${aclName[1]}.json`])

            fs.readFileSync.mockReturnValue(srcFileContent)
            acls.build(buildPermissionGroupDirectory)
            expect(fs.writeFileSync.mock.calls.length).toBe(2)
            expect(fs.writeFileSync).toHaveBeenNthCalledWith(1, path.join(buildPermissionGroupDirectory, `${acls.getName()}`, `${aclName[0]}.json`), srcFileContent)

            expect(fs.writeFileSync).toHaveBeenNthCalledWith(2, path.join(buildPermissionGroupDirectory, `${acls.getName()}`, `${aclName[1]}.json`), srcFileContent)
        })
    })
    describe('Deploy test suit', () => {
        test('All ACL files are deployed successfully', async () => {
            axios.mockResolvedValue({ data: expectedGigyaResponseOk })
            const getSiteInfo = {
                partnerId: 123123,
                dataCenter: 'eu1',
            }
            const srcFileContent = JSON.stringify(expectedAclResponse.acl)
            const aclName = Object.keys(expectedACLFileContent)
            const buildPermissionGroupDirectory = path.join(partnerBuildDirectory, permissionGroupDirectoryName)
            const dirExists = true
            fs.existsSync.mockReturnValue(dirExists)
            fs.readdirSync.mockReturnValue([`${aclName[0]}.json`, `${aclName[1]}.json`])
            fs.readFileSync.mockReturnValue(srcFileContent)
            let spy = jest.spyOn(acls, 'setAclRequest')
            acls.deploy(buildPermissionGroupDirectory, getSiteInfo)
            expect(spy.mock.calls.length).toBe(1)
            expect(spy).toHaveBeenNthCalledWith(1, getSiteInfo.dataCenter, aclName[0], getSiteInfo.partnerId, expectedAclResponse.acl, credentials)
        })
        test('all ACL files were not deployed unsuccessfully', async () => {
            const getSiteInfo = {
                partnerId: 123123,
                dataCenter: 'us1',
            }
            const buildPermissionGroupDirectory = path.join(partnerBuildDirectory, permissionGroupDirectoryName)
            axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
            fs.readFileSync.mockReturnValue(true)
            await expect(acls.deploy(buildPermissionGroupDirectory, getSiteInfo)).rejects.toThrow(Error)
        })
        test('ACL files returns empty', async () => {
            const getSiteInfo = {
                partnerId: 123123,
                dataCenter: 'us1',
            }
            const aclName = Object.keys(expectedACLFileContent)
            const buildPermissionGroupDirectory = path.join(partnerBuildDirectory, permissionGroupDirectoryName)
            fs.readdirSync.mockReturnValue([`${aclName[0]}.json`])
            fs.readFileSync.mockReturnValue([])
            await expect(acls.deploy(buildPermissionGroupDirectory, getSiteInfo)).rejects.toThrowError(`Invalid file: ${aclName[0]}.json`)
        })
    })
})
