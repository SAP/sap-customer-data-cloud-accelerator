import { expectedGigyaResponseNok, expectedSchemaResponse, getSiteConfig } from '../init/testCommon'
import fs from 'fs'
import Schema from './schema'
import axios from 'axios'
import path from 'path'
import { SRC_DIRECTORY, BUILD_DIRECTORY } from '../constants'
import ToolkitSchemaOptions from '../sap-cdc-toolkit/copyConfig/schema/schemaOptions'

jest.mock('axios')
jest.mock('fs')

const credentials = {
    userKey: 'userKey',
    secret: 'secret',
}
const siteDomain = 'domain.test.com'
const apiKey = 'apiKey'
const schema = new Schema(credentials)

describe('Init schema test suite', () => {
    test('all schema files are generated successfully', async () => {
        await successfullTest(false, false)
    })

    test('all schema files are generated successfully with reset', async () => {
        await successfullTest(true, true)
    })

    test('get schema failed', async () => {
        axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
        await expect(schema.init(apiKey, getSiteConfig, siteDomain, false)).rejects.toEqual(new Error(JSON.stringify(expectedGigyaResponseNok)))
    })

    test('feature directory already exists', async () => {
        axios.mockResolvedValueOnce({ data: expectedSchemaResponse })

        fs.existsSync.mockReturnValue(true)
        await expect(schema.init(apiKey, getSiteConfig, siteDomain, false)).rejects.toEqual(
            new Error(
                `The "${path.join(
                    SRC_DIRECTORY,
                    siteDomain,
                    schema.getName(),
                )}" directory already exists, to overwrite it's contents please use the option "reset" instead of "init"`,
            ),
        )
    })

    async function successfullTest(reset, dirExists) {
        axios.mockResolvedValueOnce({ data: expectedSchemaResponse })

        fs.existsSync.mockReturnValue(dirExists)
        fs.mkdirSync.mockReturnValue(undefined)
        fs.writeFileSync.mockReturnValue(undefined)

        await schema.init(apiKey, getSiteConfig, siteDomain, reset)

        const srcDirectory = path.join(SRC_DIRECTORY, siteDomain, schema.getName())
        expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
        if (dirExists) {
            expect(fs.rmSync).toHaveBeenCalledWith(srcDirectory, { force: true, recursive: true })
        }
        expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(srcDirectory, Schema.DATA_SCHEMA_FILE_NAME), JSON.stringify(expectedSchemaResponse.dataSchema, null, 4))
        expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(srcDirectory, Schema.PROFILE_SCHEMA_FILE_NAME), JSON.stringify(expectedSchemaResponse.profileSchema, null, 4))
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            path.join(srcDirectory, Schema.SUBSCRIPTIONS_SCHEMA_FILE_NAME),
            JSON.stringify(expectedSchemaResponse.subscriptionsSchema, null, 4),
        )
    }
})

describe('Build schema test suite', () => {
    test('all schema files are build successfully', async () => {
        const srcFileContent = JSON.stringify({
            fields: {
                phoneDataQualityStatus: {
                    required: false,
                    format: "regex('^[^<>()!¡]+$')",
                    type: 'string',
                    allowNull: true,
                    writeAccess: 'clientModify',
                    subType: 'none',
                },
                dynamicSchema: false,
            },
        })

        const dirExists = true
        fs.existsSync.mockReturnValue(dirExists)
        fs.rmSync.mockReturnValue(undefined)
        fs.mkdirSync.mockReturnValue(undefined)
        fs.writeFileSync.mockReturnValue(undefined)
        fs.readFileSync.mockReturnValue(srcFileContent)

        await schema.build(siteDomain)

        const buildDirectory = path.join(BUILD_DIRECTORY, siteDomain, schema.getName())
        expect(fs.existsSync).toHaveBeenCalledWith(buildDirectory)
        if (dirExists) {
            expect(fs.rmSync).toHaveBeenCalledWith(buildDirectory, { force: true, recursive: true })
        }
        expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(buildDirectory, Schema.DATA_SCHEMA_FILE_NAME), JSON.stringify(JSON.parse(srcFileContent), null, 4))
        expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(buildDirectory, Schema.PROFILE_SCHEMA_FILE_NAME), JSON.stringify(JSON.parse(srcFileContent), null, 4))
        expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(buildDirectory, Schema.SUBSCRIPTIONS_SCHEMA_FILE_NAME), JSON.stringify(JSON.parse(srcFileContent), null, 4))
    })
})

describe('Deploy schema test suite', () => {
    test('all schema files are deployed successfully', async () => {
        const srcFileContent = JSON.stringify({
            fields: {
                phoneDataQualityStatus: {
                    required: false,
                    format: "regex('^[^<>()!¡]+$')",
                    type: 'string',
                    allowNull: true,
                    writeAccess: 'clientModify',
                    subType: 'none',
                },
                dynamicSchema: false,
            },
        })
        fs.readFileSync.mockReturnValue(srcFileContent)
        const payload = {
            dataSchema: JSON.parse(srcFileContent),
            profileSchema: JSON.parse(srcFileContent),
            subscriptionsSchema: JSON.parse(srcFileContent),
        }
        let spy = jest.spyOn(schema, 'deployUsingToolkit')
        await schema.deploy(apiKey, getSiteConfig, siteDomain)
        expect(spy.mock.calls.length).toBe(1)
        expect(spy).toHaveBeenNthCalledWith(1, apiKey, getSiteConfig, payload, new ToolkitSchemaOptions())
    })
})
