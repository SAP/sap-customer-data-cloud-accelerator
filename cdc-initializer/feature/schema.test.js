import { expectedGigyaResponseNok, expectedSchemaResponse, getSiteConfig } from '../init/testCommon.js'
import fs from 'fs'
import Schema from './schema.js'
import axios from 'axios'
import path from 'path'
import ToolkitSchemaOptions from '../sap-cdc-toolkit/copyConfig/schema/schemaOptions.js'
import { SRC_DIRECTORY, BUILD_DIRECTORY } from './constants'
import { credentials, siteDomain, apiKey, srcSiteDirectory } from './test.common.js'

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
            console.log('file ../sap-cdc-toolkit/search/SiteFinderPaginated.js exists?', fs.existsSync('../sap-cdc-toolkit/search/SiteFinderPaginated.js'))
            console.log("bms- reading file ../sap-cdc-toolkit/search/SiteFinderPaginated.js", fs.readFileSync('../sap-cdc-toolkit/search/SiteFinderPaginated.js'))
            console.log('file ../sap-cdc-toolkit/github/client.js exists?', fs.existsSync('../sap-cdc-toolkit/github/client.js'))
            console.log("bms- reading file ../sap-cdc-toolkit/github/client.js", fs.readFileSync('../sap-cdc-toolkit/github/client.js'))

            axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
            await expect(schema.init(apiKey, getSiteConfig, siteDomain, false)).rejects.toEqual(new Error(JSON.stringify(expectedGigyaResponseNok)))
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
            const srcFileContent = JSON.stringify(expectedSchemaResponse.dataSchema)
            fs.readFileSync.mockReturnValue(srcFileContent)
            const payload = {
                dataSchema: JSON.parse(srcFileContent),
                profileSchema: JSON.parse(srcFileContent),
                subscriptionsSchema: JSON.parse(srcFileContent),
            }
            let spy = jest.spyOn(schema, 'deployUsingToolkit')
            await schema.deploy(apiKey, getSiteConfig, srcSiteDirectory)
            expect(spy.mock.calls.length).toBe(1)
            expect(spy).toHaveBeenNthCalledWith(1, apiKey, getSiteConfig, payload, new ToolkitSchemaOptions())
        })
    })
})
