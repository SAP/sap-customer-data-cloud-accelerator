import {
    expectedGigyaResponseNok,
    expectedSchemaResponse, getSiteConfig,
} from "../init/testCommon";
import fs from "fs";
import Schema from "./schema";
import axios from 'axios'
import path from "path";
import {SRC_DIRECTORY} from "../constants";

jest.mock('axios')
jest.mock('fs')

describe('Init schema test suite', () => {
    const credentials = {
        userKey: 'userKey',
        secret: 'secret'
    }
    const siteDomain = 'domain.test.com'
    const apiKey = 'apiKey'

    test('all schema files are generated successfully', async () => {
        await successfullTest(false, false)
    })

    test('all schema files are generated successfully with reset', async () => {
        await successfullTest(true, true)
    })

    test('get schema failed', async () => {
        axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
        const schema = new Schema(credentials)
        await expect(schema.init(apiKey, getSiteConfig, siteDomain, false)).rejects.toEqual(new Error(JSON.stringify(expectedGigyaResponseNok)))
    })

    test('feature directory already exists', async () => {
        axios.mockResolvedValueOnce({ data: expectedSchemaResponse })

        fs.existsSync.mockReturnValue(true)
        const schema = new Schema(credentials)
        await expect(schema.init(apiKey, getSiteConfig, siteDomain, false)).rejects.toEqual(new Error(`The "${path.join(SRC_DIRECTORY, siteDomain, schema.getName())}" directory already exists, to overwrite it's contents please use the option "reset" instead of "init"`))
    })

    async function successfullTest(reset, dirExists) {
        axios.mockResolvedValueOnce({ data: expectedSchemaResponse })

        fs.existsSync.mockReturnValue(dirExists)
        fs.mkdirSync.mockReturnValue(undefined)
        fs.writeFileSync.mockReturnValue(undefined)

        const schema = new Schema(credentials)
        await schema.init(apiKey, getSiteConfig, siteDomain, reset)

        const srcDirectory = path.join(SRC_DIRECTORY, siteDomain, schema.getName())
        expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
        if(dirExists) {
            expect(fs.rmSync).toHaveBeenCalledWith(srcDirectory, {"force": true, "recursive": true})
        }
        expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(srcDirectory, Schema.DATA_SCHEMA_FILE_NAME), JSON.stringify(expectedSchemaResponse.dataSchema, null, 4))
        expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(srcDirectory, Schema.PROFILE_SCHEMA_FILE_NAME), JSON.stringify(expectedSchemaResponse.profileSchema, null, 4))
        expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(srcDirectory, Schema.SUBSCRIPTIONS_SCHEMA_FILE_NAME), JSON.stringify(expectedSchemaResponse.subscriptionsSchema, null, 4))
    }
})
