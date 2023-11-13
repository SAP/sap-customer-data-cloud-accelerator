import HookInit from './hookInit.js'
import { PREVIEW_TEMPLATE_FILE, SRC_DIRECTORY } from './constants.js'
import fs from 'fs'
import path from 'path'

jest.mock('fs')

describe('HookInit test suite', () => {
    const hook = new HookInit()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('pre executed successfully', async () => {
        const fileContent = 'some content'
        fs.readFileSync.mockReturnValue(fileContent)
        hook.pre()
        expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(SRC_DIRECTORY, path.basename(PREVIEW_TEMPLATE_FILE)), fileContent)
    })
})
