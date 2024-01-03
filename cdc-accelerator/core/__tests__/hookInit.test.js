import HookInit from '../hookInit.js'
import { PREVIEW_TEMPLATE_FILE, SRC_DIRECTORY } from '../constants.js'
import fs from 'fs'
import path from 'path'

jest.mock('fs')

describe('HookInit test suite', () => {
    const hook = new HookInit()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('Create index.html file', async () => {
        const fileContent = 'some content'
        fs.existsSync.mockReturnValue(false)
        fs.readFileSync.mockReturnValue(fileContent)
        hook.pre()
        expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(SRC_DIRECTORY, path.basename(PREVIEW_TEMPLATE_FILE)), fileContent)
    })

    test('Already exists index.html file', async () => {
        const fileContent = 'some content'
        fs.existsSync.mockReturnValue(true)
        hook.pre()
        expect(fs.readFileSync).not.toHaveBeenCalled()
        expect(fs.writeFileSync).not.toHaveBeenCalled()
    })
})
