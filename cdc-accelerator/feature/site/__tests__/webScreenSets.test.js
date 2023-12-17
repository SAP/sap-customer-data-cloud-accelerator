import { apiKey, buildSiteDirectory, credentials, siteDomain, srcSiteDirectory } from '../../__tests__/test.common.js'
import axios from 'axios'
import { expectedGigyaResponseNok, expectedGigyaResponseOk, getExpectedScreenSetResponse, getSiteConfig, screenSetIds, screenSetTemplate } from '../../__tests__/test.gigyaResponses.js'
import fs from 'fs'
import path from 'path'
import WebScreenSets from '../webScreenSets.js'
import { Operations } from '../../../core/constants.js'
import Terminal from '../../../core/terminal.js'

jest.mock('axios')
jest.mock('fs')
jest.mock('../../../core/terminal.js')

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
            await testNoScreenSets(Operations.init)
        })

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

    describe('Deploy test suite', () => {
        test('no screen sets', async () => {
            await testNoScreenSets(Operations.deploy)
        })

        test('get screen set failed', async () => {
            axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
            await expect(webScreenSets.deploy(apiKey, getSiteConfig, buildSiteDirectory)).rejects.toEqual(new Error(JSON.stringify(expectedGigyaResponseNok)))
        })

        test('original screen set do not exists', async () => {
            const screenSetIdFilter = screenSetIds[0]
            const mockedResponse = getExpectedScreenSetResponse(screenSetIdFilter)
            axios.mockResolvedValueOnce({ data: mockedResponse })
            fs.existsSync.mockReturnValue(false)
            fs.readdirSync.mockReturnValueOnce(['notExists'])

            const response = await webScreenSets.deploy(apiKey, getSiteConfig, buildSiteDirectory)
            expect(response).toBeDefined()
            expect(response.length).toBe(1)
            expect(response[0]).toBeTruthy()
        })

        test('original screen set do not have html', async () => {
            const screenSetIdFilter = screenSetIds[0]
            const mockedResponse = getExpectedScreenSetResponse(screenSetIdFilter)
            mockedResponse.screenSets[0].html = ''
            axios.mockResolvedValueOnce({ data: mockedResponse })
            fs.existsSync.mockReturnValue(false)
            fs.readdirSync.mockReturnValueOnce([screenSetIdFilter])

            const expectedError = JSON.parse(JSON.stringify(screenSetTemplate))
            expectedError.html = ''
            await expect(webScreenSets.deploy(apiKey, getSiteConfig, buildSiteDirectory)).rejects.toEqual(
                new Error(`Original ScreenSet ${screenSetIdFilter} do not contains html on site ${apiKey}: ${JSON.stringify(expectedError)}`),
            )
        })

        test('2 screen sets, one do not have html', async () => {
            const screenSetIdFilter = screenSetIds[1]
            const mockedResponse = getExpectedScreenSetResponse(screenSetIdFilter)
            mockedResponse.screenSets[0].html = ''
            mockedResponse.screenSets.push(screenSetTemplate)
            axios.mockResolvedValueOnce({ data: mockedResponse }).mockResolvedValue({ data: expectedGigyaResponseOk })
            fs.existsSync.mockReturnValue(false)
            fs.readdirSync.mockReturnValueOnce([screenSetIds[0], screenSetIdFilter])

            const expectedError = JSON.parse(JSON.stringify(screenSetTemplate))
            expectedError.html = ''
            expectedError.screenSetID = screenSetIdFilter
            await expect(webScreenSets.deploy(apiKey, getSiteConfig, buildSiteDirectory)).rejects.toEqual(
                new Error(`Original ScreenSet ${screenSetIdFilter} do not contains html on site ${apiKey}: ${JSON.stringify(expectedError)}`),
            )
        })

        test('screen sets successfully with js and css', async () => {
            const expectedJavascript = '{ javascript code here }'
            const expectedCss = '{ css code here }'
            const screenSetIdFilter = screenSetIds[0]
            const mockedResponse = getExpectedScreenSetResponse(screenSetIdFilter)
            mockedResponse.screenSets.every((screenSet) => {
                screenSet.javascript = expectedJavascript
                screenSet.css = expectedCss
            })
            axios.mockResolvedValueOnce({ data: mockedResponse }).mockResolvedValue({ data: expectedGigyaResponseOk })
            fs.existsSync.mockReturnValue(true)
            fs.readFileSync.mockReturnValueOnce(expectedJavascript).mockReturnValueOnce(expectedCss)
            fs.readdirSync.mockReturnValueOnce([screenSetIdFilter])

            const payload = {
                javascript: expectedJavascript,
                css: expectedCss,
                html: screenSetTemplate.html,
                screenSetID: screenSetIdFilter,
            }
            let spy = jest.spyOn(webScreenSets, 'deployUsingToolkit')

            const response = await webScreenSets.deploy(apiKey, getSiteConfig, buildSiteDirectory)
            expect(response).toBeDefined()
            expect(response.length).toBe(1)
            expect(spy.mock.calls.length).toBe(1)
            expect(spy).toHaveBeenNthCalledWith(1, apiKey, getSiteConfig.dataCenter, payload)
        })

        test('several screen sets successfully', async () => {
            axios.mockResolvedValueOnce({ data: getExpectedScreenSetResponse() }).mockResolvedValue({ data: expectedGigyaResponseOk })
            fs.existsSync.mockReturnValue(false)
            fs.readdirSync.mockReturnValueOnce(screenSetIds)

            const response = await webScreenSets.deploy(apiKey, getSiteConfig, buildSiteDirectory)
            expect(response).toBeDefined()
            expect(response.length).toBe(screenSetIds.length)
            response.every((r) => expect(r).toStrictEqual(expectedGigyaResponseOk))
        })
    })

    describe('Build test suite', () => {
        test('javascript file generated', async () => {
            const screenSetIdFilter = 'Default-LinkAccounts'
            const mockedResponse = getExpectedScreenSetResponse(screenSetIdFilter)
            axios.mockResolvedValueOnce({ data: mockedResponse })

            jest.spyOn(fs, 'existsSync').mockReturnValue(false)
            fs.readdirSync
                .mockReturnValueOnce([screenSetIdFilter, 'file.js'])
                .mockReturnValueOnce([`${screenSetIdFilter}.js`, 'file.js'])
                .mockReturnValueOnce([`${screenSetIdFilter}.js`, 'file.js'])
            jest.spyOn(fs, 'lstatSync')
                .mockReturnValueOnce({
                    isDirectory: function () {
                        return true
                    },
                })
                .mockReturnValueOnce({
                    isDirectory: function () {
                        return false
                    },
                })

            const file = 'var _default = {' + `import module1 from '${screenSetIdFilter}File2.js'` + 'export default {' + '    func1: function (event) {}' + '};'
            const expectedFile = '{' + "import module1 from 'Default-LinkAccountsFile2.js'" + 'export default {' + '    func1: function (event) {}' + '}'

            fs.existsSync.mockReturnValue(true)
            const cssDefault = 'css default content'
            const cssCustom = 'css custom content'
            fs.readFileSync.mockReturnValueOnce(file).mockReturnValueOnce(cssDefault).mockReturnValueOnce(cssCustom)

            await webScreenSets.build(srcSiteDirectory)
            expect(Terminal.executeBabel).toHaveBeenCalledWith(path.join(srcSiteDirectory, webScreenSets.getName()))
            expect(Terminal.executePrettier).toHaveBeenCalledWith(path.join(buildSiteDirectory, webScreenSets.getName()))
            const expectedCss = `${cssDefault}\n\n${WebScreenSets.TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_START}\n\n${cssCustom}\n\n${WebScreenSets.TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_END}\n`
            expect(fs.writeFileSync).toHaveBeenNthCalledWith(1, path.join(buildSiteDirectory, webScreenSets.getName(), screenSetIdFilter, `${screenSetIdFilter}.js`), expectedFile)
            expect(fs.writeFileSync).toHaveBeenNthCalledWith(2, path.join(buildSiteDirectory, webScreenSets.getName(), screenSetIdFilter, `${screenSetIdFilter}.css`), expectedCss)
        })
    })

    async function testNoScreenSets(method) {
        const mockedResponse = getExpectedScreenSetResponse('unknown')
        axios.mockResolvedValueOnce({ data: mockedResponse })

        await expect(webScreenSets[method](apiKey, getSiteConfig, srcSiteDirectory)).rejects.toEqual(
            new Error('There are no screenSets in this site. Please navigate to the UI Builder in the browser to automatically generate the default screenSets, then try again.'),
        )
    }
})
