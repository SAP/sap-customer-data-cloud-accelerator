// Import necessary modules and the WebSdk class
import fs from 'fs';
import path from 'path';
import WebSdk from './webSdk'; 
import axios from 'axios'
import { SRC_DIRECTORY,BUILD_DIRECTORY } from '../constants'
import { expectedGigyaResponseNok, expectedGlobalConf, getSiteConfig } from '../init/testCommon'
import { cleanJavaScriptModuleBoilerplateWebSdk, replaceFilenamesWithFileContents } from '../utils/utils';
jest.mock('axios')
jest.mock('fs');

const credentials = {
    userKey: 'userKey',
    secret: 'secret',
}
const siteDomain = 'domain.test.com'
const apiKey = 'apiKey'
let webSdkInstance = new WebSdk(credentials); 

describe('Init webSdk test suite', () => {
  beforeEach(() => {
    fs.existsSync.mockReset()
    fs.readFileSync.mockReset()
    fs.rmSync.mockReset()
    fs.mkdirSync.mockReset()
    fs.writeFileSync.mockReset()
  })
  it('all webSdk files are generated successfully', async () => {
  axios.mockResolvedValueOnce({ data: expectedGlobalConf })

  fs.existsSync.mockReturnValue(false)
  fs.readFileSync.mockReturnValue(expectedGlobalConf)
  fs.mkdirSync.mockReturnValue(undefined)
  fs.writeFileSync.mockReturnValue(undefined)

  await webSdkInstance.init(apiKey, expectedGlobalConf, siteDomain);
  const srcDirectory = path.join(SRC_DIRECTORY, siteDomain, webSdkInstance.getName())

  const writeFile = path.join(SRC_DIRECTORY,siteDomain,webSdkInstance.getName(), `${webSdkInstance.getName()}.js`)
  expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
  expect(fs.writeFileSync).toHaveBeenCalledWith(writeFile, `export default ${expectedGlobalConf}`)

  });

  it('should get webSdk fail', async () => {
    axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })

    fs.existsSync.mockResolvedValueOnce(true)
    const pathSite = path.join(SRC_DIRECTORY,siteDomain,webSdkInstance.getName())
    await expect(webSdkInstance.init(apiKey,expectedGlobalConf,siteDomain)).rejects.toEqual(new Error(`The "${pathSite}" directory already exists, to overwrite it's contents please use the option "reset" instead of "init"`))
  });

  it('feature directory already exists', async () => {
    axios.mockResolvedValueOnce({ data: expectedGlobalConf })
    fs.existsSync.mockReturnValue(true)
    await expect(webSdkInstance.init(apiKey,expectedGlobalConf,siteDomain)).rejects.toEqual(
      new Error(
          `The "${path.join(
              SRC_DIRECTORY,
              siteDomain,
              webSdkInstance.getName(),
          )}" directory already exists, to overwrite it's contents please use the option "reset" instead of "init"`,
      ),
  )

  });

  it('should create a new webSdk file with default template when globalConf is empty', async () => {
    const siteConfig = {}
    fs.existsSync.mockReturnValue(false)
    fs.readFileSync.mockReturnValue(siteConfig)
    await webSdkInstance.init(apiKey,expectedGlobalConf,siteDomain)
    const srcDirectory = path.join(SRC_DIRECTORY, siteDomain, webSdkInstance.getName())
    const writeFile = path.join(SRC_DIRECTORY,siteDomain,webSdkInstance.getName(), `${webSdkInstance.getName()}.js`)

    expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
    expect(fs.writeFileSync).toHaveBeenCalledWith(writeFile, `export default ${siteConfig}`)
  })
  
});

describe('Reset WebSdk test suite', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.resetAllMocks()
    jest.clearAllMocks()
  })
  
  it('should reset webSdk with existing directory', () => {
    testReset(true)
  });

  it('should reset webSdk with non existing directory', () => {
    testReset(false)
  });


  function testReset(dirExists) {
    fs.existsSync.mockReturnValue(dirExists)
    fs.rmSync.mockReturnValue(undefined)

    webSdkInstance.reset(siteDomain);
    const featureDirectory = path.join(SRC_DIRECTORY, siteDomain, webSdkInstance.getName())
    expect(fs.existsSync).toHaveBeenCalledWith(featureDirectory)
    if (dirExists) {
        expect(fs.rmSync).toHaveBeenCalledWith(featureDirectory, { force: true, recursive: true })
    } else {
      expect(fs.rmSync).not.toHaveBeenCalled()
    }
}

})

describe('Build webSdk test suite', () => {
  test ('all webSdk files are build successfully', () => {
    let srcFileContent = getSiteConfig.globalConf
    const srcDirectory = path.join(BUILD_DIRECTORY, siteDomain, webSdkInstance.getName())
    const dirExists = true
    fs.existsSync.mockReturnValue(dirExists)
    fs.rmSync.mockReturnValue(undefined)
    fs.mkdirSync.mockReturnValue(undefined)
    fs.writeFileSync.mockReturnValue(undefined)
    fs.readFileSync.mockReturnValue(srcFileContent)
    srcFileContent =cleanJavaScriptModuleBoilerplateWebSdk(srcFileContent)
    webSdkInstance.build(siteDomain)
    let websdkfile = replaceFilenamesWithFileContents(srcFileContent, srcDirectory).trim()

    if(dirExists){
      expect(fs.rmSync).toHaveBeenCalledWith(srcDirectory, { force: true, recursive: true })
    }
    expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(srcDirectory, `${webSdkInstance.getName()}.js`),websdkfile)
  } )
})

describe('Deploy webSdk test suite', () => {
  test('all webSdk files are deployed successfully', async () => {
    let srcFileContent = expectedGlobalConf

 fs.readFileSync.mockReturnValue(srcFileContent);

 let spy = jest.spyOn(webSdkInstance, 'deploy')
 await webSdkInstance.deploy(apiKey, getSiteConfig, siteDomain);
 expect(fs.readFileSync).toHaveBeenCalled();
 expect(spy.mock.calls.length).toBe(1)
 expect(spy).toHaveBeenCalledWith(
   apiKey,
   getSiteConfig,
   siteDomain
 );
});
  })

  describe('Deploy webSdk test suite', () => {
    test('all webSdk files are deployed successfully', async () => {
        const srcFileContent = getSiteConfig
        fs.readFileSync.mockReturnValue(srcFileContent.globalConf)
        let spy = jest.spyOn(webSdkInstance, 'deploy')
        await webSdkInstance.deploy(apiKey, getSiteConfig, siteDomain)
        expect(spy.mock.calls.length).toBe(2)
        expect(spy).toHaveBeenNthCalledWith(2, apiKey, getSiteConfig, siteDomain)
    })
})
