import { expectedGigyaResponseNok, expectedGigyaResponseOk, expectedPermissionGroupsResponse } from './test.gigyaResponses.js'
import fs from 'fs'
import axios from 'axios'
import path from 'path'
import { credentials, partnerBaseDirector } from './test.common.js'
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
            axios.mockResolvedValueOnce({ data: expectedPermissionGroupsResponse })
            const getSiteInfo = {
                partnerId: 123123,
            }
            fs.existsSync.mockReturnValue(false)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockReturnValue(undefined)
            await permissionGroups.init(getSiteInfo, partnerBaseDirector)
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
            await expect(permissionGroups.init(getSiteInfo, partnerBaseDirector)).rejects.toEqual(new Error(JSON.stringify(expectedGigyaResponseNok)))
        })
        test('feature directory already exists', async () => {
            const getSiteInfo = {
                partnerId: 123123,
            }
            axios.mockResolvedValueOnce({ data: expectedPermissionGroupsResponse })
            fs.existsSync.mockReturnValue(true)
            await expect(permissionGroups.init(getSiteInfo, partnerBaseDirector)).rejects.toEqual(
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
            axios.mockResolvedValueOnce({ data: expectedGigyaResponseOk })
            fs.existsSync.mockReturnValue(false)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockImplementation(() => {
                throw new Error('File write error')
            })
            await expect(permissionGroups.init(getSiteInfo, partnerBaseDirector)).rejects.toThrow('File write error')
        })
    })
})
