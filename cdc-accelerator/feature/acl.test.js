import ACL from './acl.js'
import fs from 'fs'
import axios from 'axios'
import path from 'path'
import { expectedGigyaResponseNok, expectedAclResponse, expectedPermissionGroupsResponse } from './test.gigyaResponses.js'
import { credentials, partnerBaseDirectory } from './test.common.js'
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
})
