import { apiKey, credentials, siteDomain, srcSiteDirectory } from './test.common.js'
import axios from 'axios'
import { expectedGigyaResponseNok, getExpectedScreenSetResponse, getSiteConfig } from './test.gigyaResponses.js'
import fs from 'fs'
import path from 'path'
import WebScreenSets from './webScreenSets.js'

jest.mock('axios')
jest.mock('fs')

describe('WebScreenSets test suite', () => {
    const webScreenSets = new WebScreenSets(credentials)

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Init test suite', () => {
        test('javascript file generated with template content', async () => {
            await testJavascriptSingleScreenSet(undefined)
        })

        test('javascript file generated with custom content', async () => {
            await testJavascriptSingleScreenSet('{ javascript code here }')
        })

        test('css file generated without custom content', async () => {
            const css =
                '.gigya-screen-caption{font-family:arial;padding-left:11px;line-height:40px}.gigya-screen,.gigya-screen *{margin:0 auto;padding:0;border:none;color:inherit;'
            await testNoCustomCssSingleScreenSet(css, css, '')
        })

        test('css file generated with custom content', async () => {
            const css =
                '.gigya-screen-caption{font-family:arial;padding-left:11px;line-height:40px}/* || CUSTOM CODE START */.gigya-screen,/* || CUSTOM CODE END */.gigya-screen *{margin:0 auto;padding:0;border:none;color:inherit;'
            await testNoCustomCssSingleScreenSet(
                css,
                '.gigya-screen-caption{font-family:arial;padding-left:11px;line-height:40px}.gigya-screen *{margin:0 auto;padding:0;border:none;color:inherit;',
                '.gigya-screen,',
            )
        })

        test('feature directory already exists', async () => {
            const mockedResponse = getExpectedScreenSetResponse('Default-LinkAccounts')
            axios.mockResolvedValueOnce({ data: mockedResponse })

            fs.existsSync.mockReturnValue(true)
            await expect(webScreenSets.init(apiKey, getSiteConfig, srcSiteDirectory, false)).rejects.toEqual(
                new Error(
                    `The "${path.join(
                        srcSiteDirectory,
                        webScreenSets.getName(),
                    )}" directory already exists, to overwrite its contents please use the option "reset" instead of "init"`,
                ),
            )
        })

        test('no screen sets', async () => {
            const mockedResponse = getExpectedScreenSetResponse('Default-LinkAccounts')
            mockedResponse.screenSets = []
            axios.mockResolvedValueOnce({ data: mockedResponse })

            await expect(webScreenSets.init(apiKey, getSiteConfig, srcSiteDirectory, false)).rejects.toEqual(
                new Error(
                    'There are no screenSets in this site. Please navigate to the UI Builder in the browser to automatically generate the default screenSets, then try again.',
                ),
            )
        })
        /*
        test('Single screen set file are generated successfully using javascript template, no custom css', async () => {
            const screenSetIdFilter = 'Default-LinkAccounts'
            const mockedResponse = getExpectedScreenSetResponse(screenSetIdFilter)
            axios.mockResolvedValueOnce({data: mockedResponse})

            const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockReturnValue(undefined)
            const defaultScreenSetJavascript = "{"+
                "onError: function (event) {"+
                    "return 'default template'"+
                "}"+
            "}"
            const readFileSyncSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue(defaultScreenSetJavascript)
            //fs.readFileSync.mockReturnValue(defaultScreenSetJavascript)

            await webScreenSets.init(apiKey, getSiteConfig, srcSiteDirectory)

            const srcDirectory = path.join(srcSiteDirectory, webScreenSets.getName())
            const screenSetDirectory = path.join(srcDirectory, screenSetIdFilter)

            expect(existsSyncSpy.mock.calls.length).toBe(2)
            expect(readFileSyncSpy.mock.calls.length).toBe(1)
            expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
            expect(fs.existsSync).toHaveBeenCalledWith(screenSetDirectory)
            expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(screenSetDirectory, `${screenSetIdFilter}.js`), `export default ${defaultScreenSetJavascript};\n`)
            expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(screenSetDirectory, `${screenSetIdFilter}.default.css`), mockedResponse.screenSets[0].css)
            expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(screenSetDirectory, `${screenSetIdFilter}.custom.css`), "")
        })

        test('Single screen set file are generated successfully using javascript, no custom css', async () => {
            const screenSetIdFilter = 'Default-LinkAccounts'
            const mockedResponse = getExpectedScreenSetResponse(screenSetIdFilter)
            const defaultScreenSetJavascript = "{ javascript code here }"
            mockedResponse.screenSets[0].javascript = defaultScreenSetJavascript
            axios.mockResolvedValueOnce({data: mockedResponse})

            const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockReturnValue(undefined)

            const readFileSyncSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue(defaultScreenSetJavascript)
            //fs.readFileSync.mockReturnValue(defaultScreenSetJavascript)

            await webScreenSets.init(apiKey, getSiteConfig, srcSiteDirectory)

            const srcDirectory = path.join(srcSiteDirectory, webScreenSets.getName())
            const screenSetDirectory = path.join(srcDirectory, screenSetIdFilter)

            expect(existsSyncSpy.mock.calls.length).toBe(2)
            expect(readFileSyncSpy.mock.calls.length).toBe(0)
            expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
            expect(fs.existsSync).toHaveBeenCalledWith(screenSetDirectory)
            expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(screenSetDirectory, `${screenSetIdFilter}.js`), `export default ${defaultScreenSetJavascript};\n`)
            expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(screenSetDirectory, `${screenSetIdFilter}.default.css`), mockedResponse.screenSets[0].css)
            expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(screenSetDirectory, `${screenSetIdFilter}.custom.css`), "")
        })

 */

        test('get screen set failed', async () => {
            axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
            await expect(webScreenSets.init(apiKey, getSiteConfig, siteDomain, false)).rejects.toEqual(new Error(JSON.stringify(expectedGigyaResponseNok)))
        })

        async function testJavascriptSingleScreenSet(javascript) {
            const screenSetIdFilter = 'Default-LinkAccounts'
            const mockedResponse = getExpectedScreenSetResponse(screenSetIdFilter)
            mockedResponse.screenSets[0].javascript = javascript
            axios.mockResolvedValueOnce({ data: mockedResponse })

            const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockReturnValue(undefined)
            let expectedJavascript = javascript ? javascript : '{' + 'onError: function (event) {' + "return 'default template'" + '}' + '}'
            const readFileSyncSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue(expectedJavascript)

            await webScreenSets.init(apiKey, getSiteConfig, srcSiteDirectory)

            const srcDirectory = path.join(srcSiteDirectory, webScreenSets.getName())
            const screenSetDirectory = path.join(srcDirectory, screenSetIdFilter)

            expect(existsSyncSpy.mock.calls.length).toBe(2)
            expect(readFileSyncSpy.mock.calls.length).toBe(javascript ? 0 : 1)
            expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
            expect(fs.existsSync).toHaveBeenCalledWith(screenSetDirectory)
            expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(screenSetDirectory, `${screenSetIdFilter}.js`), `export default ${expectedJavascript};\n`)
        }

        async function testNoCustomCssSingleScreenSet(css, expectedDefault, expectedCustom) {
            const screenSetIdFilter = 'Default-LinkAccounts'
            const mockedResponse = getExpectedScreenSetResponse(screenSetIdFilter)
            mockedResponse.screenSets[0].css = css
            axios.mockResolvedValueOnce({ data: mockedResponse })

            const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockReturnValue(undefined)

            await webScreenSets.init(apiKey, getSiteConfig, srcSiteDirectory)

            const srcDirectory = path.join(srcSiteDirectory, webScreenSets.getName())
            const screenSetDirectory = path.join(srcDirectory, screenSetIdFilter)

            expect(existsSyncSpy.mock.calls.length).toBe(2)
            expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
            expect(fs.existsSync).toHaveBeenCalledWith(screenSetDirectory)
            expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(screenSetDirectory, `${screenSetIdFilter}.default.css`), expectedDefault)
            expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(screenSetDirectory, `${screenSetIdFilter}.custom.css`), expectedCustom)
        }
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

            webScreenSets.reset(srcSiteDirectory)

            const featureDirectory = path.join(srcSiteDirectory, webScreenSets.getName())
            expect(fs.existsSync).toHaveBeenCalledWith(featureDirectory)
            if (dirExists) {
                expect(fs.rmSync).toHaveBeenCalledWith(featureDirectory, { force: true, recursive: true })
            } else {
                expect(fs.rmSync).not.toHaveBeenCalled()
            }
        }
    })
})
