import { expectedGigyaResponseNok, expectedGigyaResponseOk, expectedSchemaResponse, getSiteConfig } from '../../__tests__/test.gigyaResponses.js'
import fs from 'fs'
import Schema from '../schema.js'
import axios from 'axios'
import path from 'path'
import ToolkitSchemaOptions from '../../../sap-cdc-toolkit/copyConfig/schema/schemaOptions.js'
import { SRC_DIRECTORY, BUILD_DIRECTORY } from '../../../core/constants.js'
import { credentials, siteDomain, apiKey, srcSiteDirectory } from '../../__tests__/test.common.js'

jest.mock('axios')
jest.mock('fs')

describe('Schema test suite', () => {
    const schema = new Schema(credentials)

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Init test suite', () => {
        test('all schema files are generated successfully', async () => {
            axios.mockResolvedValueOnce({ data: expectedSchemaResponse })

            fs.existsSync.mockReturnValue(false)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockReturnValue(undefined)

            await schema.init(apiKey, getSiteConfig, srcSiteDirectory)

            const srcDirectory = path.join(srcSiteDirectory, schema.getName())
            expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
            expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(srcDirectory, Schema.DATA_SCHEMA_FILE_NAME), JSON.stringify(expectedSchemaResponse.dataSchema, null, 4))
            expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(srcDirectory, Schema.PROFILE_SCHEMA_FILE_NAME), JSON.stringify(expectedSchemaResponse.profileSchema, null, 4))
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                path.join(srcDirectory, Schema.SUBSCRIPTIONS_SCHEMA_FILE_NAME),
                JSON.stringify(expectedSchemaResponse.subscriptionsSchema, null, 4),
            )
        })

        test('get schema failed', async () => {
            axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
            await expect(schema.init(apiKey, getSiteConfig, siteDomain)).rejects.toEqual(new Error(JSON.stringify(expectedGigyaResponseNok)))
        })

        test('feature directory already exists', async () => {
            axios.mockResolvedValueOnce({ data: expectedSchemaResponse })

            fs.existsSync.mockReturnValue(true)
            await expect(schema.init(apiKey, getSiteConfig, srcSiteDirectory, false)).rejects.toEqual(
                new Error(
                    `The "${path.join(srcSiteDirectory, schema.getName())}" directory already exists, to overwrite its contents please use the option "reset" instead of "init"`,
                ),
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

            schema.reset(srcSiteDirectory)

            const featureDirectory = path.join(srcSiteDirectory, schema.getName())
            expect(fs.existsSync).toHaveBeenCalledWith(featureDirectory)
            if (dirExists) {
                expect(fs.rmSync).toHaveBeenCalledWith(featureDirectory, { force: true, recursive: true })
            } else {
                expect(fs.rmSync).not.toHaveBeenCalled()
            }
        }
    })

    describe('Build test suite', () => {
        test('all schema files are build successfully', () => {
            const srcFileContent = JSON.stringify(expectedSchemaResponse.dataSchema)
            const dirExists = true
            fs.existsSync.mockReturnValue(dirExists)
            fs.rmSync.mockReturnValue(undefined)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockReturnValue(undefined)
            fs.readFileSync.mockReturnValue(srcFileContent)

            // for the build method it is passed the build path
            schema.build(srcSiteDirectory.replace(SRC_DIRECTORY, BUILD_DIRECTORY))

            const buildFeatureDirectory = path.join(srcSiteDirectory.replace(SRC_DIRECTORY, BUILD_DIRECTORY), schema.getName())
            expect(fs.existsSync).toHaveBeenCalledWith(buildFeatureDirectory)
            if (dirExists) {
                expect(fs.rmSync).toHaveBeenCalledWith(buildFeatureDirectory, { force: true, recursive: true })
            }
            expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(buildFeatureDirectory, Schema.DATA_SCHEMA_FILE_NAME), JSON.stringify(JSON.parse(srcFileContent), null, 4))
            expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(buildFeatureDirectory, Schema.PROFILE_SCHEMA_FILE_NAME), JSON.stringify(JSON.parse(srcFileContent), null, 4))
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                path.join(buildFeatureDirectory, Schema.SUBSCRIPTIONS_SCHEMA_FILE_NAME),
                JSON.stringify(JSON.parse(srcFileContent), null, 4),
            )
        })
    })

    describe('Deploy test suite', () => {
        test('all schema files are deployed successfully', async () => {
            await testDeploy(expectedGigyaResponseOk)
        })

        test('all schema files are deployed unsuccessfully', async () => {
            await testDeploy(expectedGigyaResponseNok)
        })

        async function testDeploy(serverResponse) {
            axios.mockResolvedValueOnce({ data: expectedSchemaResponse }).mockResolvedValue({ data: serverResponse })
            fs.readFileSync
                .mockReturnValueOnce(JSON.stringify(expectedSchemaResponse.dataSchema))
                .mockReturnValueOnce(JSON.stringify(expectedSchemaResponse.profileSchema))
                .mockReturnValueOnce(JSON.stringify(expectedSchemaResponse.subscriptionsSchema))
            const payload = {
                dataSchema: expectedSchemaResponse.dataSchema,
                profileSchema: expectedSchemaResponse.profileSchema,
                subscriptionsSchema: expectedSchemaResponse.subscriptionsSchema,
            }
            let spy = jest.spyOn(schema, 'deployUsingToolkit')
            if (serverResponse.statusCode === 200) {
                const response = await schema.deploy(apiKey, getSiteConfig, srcSiteDirectory)
                expect(response.length).toEqual(4)
            } else {
                await expect(schema.deploy(apiKey, getSiteConfig, siteDomain)).rejects.toThrow(Error)
            }
            expect(spy.mock.calls.length).toBe(1)
            expect(spy).toHaveBeenNthCalledWith(1, apiKey, getSiteConfig, payload, new ToolkitSchemaOptions())
        }
    })
})
