// Import necessary modules and the WebSdk class
import {expectedGlobalConf, getSiteConfig,expectedGigyaResponseOk,expectedGigyaResponseNok } from './test.gigyaResponses'
import fs from 'fs';
import WebSdk from './webSdk'; 
import axios from 'axios'
import path from 'path';
import { SRC_DIRECTORY,BUILD_DIRECTORY } from '../constants.js'
import { credentials, apiKey, srcSiteDirectory } from './test.common.js'

jest.mock('axios')
jest.mock('fs');
 

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

    await webSdkInstance.init(apiKey, expectedGlobalConf, srcSiteDirectory);
    const srcDirectory = path.join(srcSiteDirectory, webSdkInstance.getName())

    const writeFile = path.join(srcSiteDirectory,webSdkInstance.getName(), `${webSdkInstance.getName()}.js`)
    expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
    expect(fs.writeFileSync).toHaveBeenCalledWith(writeFile, `export default ${expectedGlobalConf}`)

  });

  it('should create a new webSdk file with default template when globalConf is empty', async () => {
    const siteConfig = {}
    fs.existsSync.mockReturnValue(false)
    const srcDirectory = path.join(srcSiteDirectory, webSdkInstance.getName())
    const writeFile = path.join(srcSiteDirectory,webSdkInstance.getName(), `${webSdkInstance.getName()}.js`)
    fs.readFileSync.mockReturnValue(siteConfig)
    await webSdkInstance.init(apiKey,expectedGlobalConf,srcSiteDirectory)
    
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

    webSdkInstance.reset(srcSiteDirectory);
    const featureDirectory = path.join(srcSiteDirectory, webSdkInstance.getName())
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
    const srcFileContent = JSON.stringify({
          enabledProviders: '*',
          lang: 'en',
          customEventMap: './test.js',
          webScreenSets: {
              utils: '*',
              calculator: '*',
          },
      
      })

    const fileContent = `export Default ${srcFileContent}`
    const dirExists = true
    fs.existsSync.mockReturnValue(dirExists)
    fs.rmSync.mockReturnValue(undefined)
    fs.mkdirSync.mockReturnValue(undefined)
    fs.writeFileSync.mockReturnValue(undefined)
    fs.readFileSync.mockReturnValue(fileContent)
    
    
    const srcDirectory = path.join(srcSiteDirectory.replace(SRC_DIRECTORY, BUILD_DIRECTORY), webSdkInstance.getName())
    // expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
    webSdkInstance.build(srcSiteDirectory.replace(SRC_DIRECTORY, BUILD_DIRECTORY))  
    if(dirExists){
      expect(fs.rmSync).toHaveBeenCalledWith(srcDirectory, { force: true, recursive: true })
    }
    expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(srcDirectory, `${webSdkInstance.getName()}.js`),srcFileContent)
  } )
})


describe('Deploy webSdk test suite', () => {
  test('all webSdk files are deployed successfully', async () => {
    axios.mockResolvedValue({ data: expectedGigyaResponseOk })
    const srcFileContent = JSON.stringify({ data:'Testing'});
    fs.readFileSync.mockReturnValue(srcFileContent)
    let spy = jest.spyOn(webSdkInstance, 'deployUsingToolkit')
    await webSdkInstance.deploy(apiKey, getSiteConfig, srcSiteDirectory)
    expect(spy.mock.calls.length).toBe(1)
    expect(spy).toHaveBeenNthCalledWith(1, apiKey, getSiteConfig, srcFileContent)
    })
  test('webSdk deploy should fail', async () => {
    axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
    const srcFileContent = JSON.stringify({ data:'Testing'});
    fs.readFileSync.mockReturnValue(srcFileContent)
    await expect(webSdkInstance.deploy(apiKey, getSiteConfig, srcSiteDirectory)).rejects.toEqual(new Error(JSON.stringify(expectedGigyaResponseNok)))
          })
})