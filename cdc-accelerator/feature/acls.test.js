import ACL from './acls.js'
import fs from 'fs'
import axios from 'axios'
import path from 'path'
import { expectedGigyaResponseNok, expectedGigyaResponseOk, expectedAclResponse, expectedPermissionGroupsResponse, expectedACLFileContent } from './test.gigyaResponses.js'
import { credentials, partnerBaseDirector, partnerBuildDirector } from './test.common.js'
jest.mock('axios')
jest.mock('fs')

describe('ACLs test suite', () => {
    const acls = new ACL(credentials)
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Init test suit', () => {
        test('All ACL files are generated sucessfully', async () => {
            axios.mockResolvedValue({ data: expectedAclResponse })
            const getSiteInfo = {
                partnerId: 123123,
                dataCenter: 'eu1',
            }
            fs.existsSync.mockReturnValue(false)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockReturnValue(undefined)
            await acls.init(JSON.stringify(expectedPermissionGroupsResponse.groups), getSiteInfo.partnerId, partnerBaseDirector, getSiteInfo.dataCenter)
            const srcDirectory = path.join(partnerBaseDirector, acls.getName())
            expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
            expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(srcDirectory, ACL.ACL_FILE_NAME), JSON.stringify(expectedACLFileContent, null, 4))
        })
        test('get ACLs failed', async () => {
            axios.mockResolvedValue({ data: expectedGigyaResponseNok })
            const getSiteInfo = {
                partnerId: 123123,
                dataCenter: 'eu1',
            }
            fs.readFileSync.mockReturnValue(true)
            await expect(acls.init(JSON.stringify(expectedPermissionGroupsResponse.groups), getSiteInfo.partnerId, partnerBaseDirector, getSiteInfo.dataCenter)).rejects.toThrow(
                new Error(JSON.stringify(expectedGigyaResponseNok)),
            )
        })
    })
})
