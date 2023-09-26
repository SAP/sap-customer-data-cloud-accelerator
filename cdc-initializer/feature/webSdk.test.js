// Import necessary modules and the WebSdk class
import {expectedGlobalConf, getSiteConfig } from '../init/testCommon'
import fs from 'fs';
import WebSdk from './webSdk'; 
import axios from 'axios'
import path from 'path';
import { SRC_DIRECTORY,BUILD_DIRECTORY } from '../constants'
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

  it('should create a new webSdk file with default template when globalConf is empty', async () => {
    const siteConfig = {}
    fs.existsSync.mockReturnValue(false)
    const srcDirectory = path.join(SRC_DIRECTORY, siteDomain, webSdkInstance.getName())
    const writeFile = path.join(SRC_DIRECTORY,siteDomain,webSdkInstance.getName(), `${webSdkInstance.getName()}.js`)
    fs.readFileSync.mockReturnValue(siteConfig)
    await webSdkInstance.init(apiKey,expectedGlobalConf,siteDomain)
    
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
      const srcFileContent = JSON.stringify({
          enabledProviders: '*',
          lang: 'en',
          customEventMap: './customEventMap/customEventMap.js',
          webScreenSets: {
              utils: '*',
              calculator: '*',
          },
      
      })

    //export default no inicio e esperar no fim se ja não tenha
    const fileContent = `export Default ${srcFileContent}`
    const dirExists = true
    fs.existsSync.mockReturnValue(dirExists)
    fs.rmSync.mockReturnValue(undefined)
    fs.mkdirSync.mockReturnValue(undefined)
    fs.writeFileSync.mockReturnValue(undefined)
    fs.readFileSync.mockReturnValue(fileContent)
    
    
    const srcDirectory = path.join(BUILD_DIRECTORY, siteDomain, webSdkInstance.getName())
    // expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
    webSdkInstance.build(siteDomain)  
    if(dirExists){
      expect(fs.rmSync).toHaveBeenCalledWith(srcDirectory, { force: true, recursive: true })
    }
    expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(srcDirectory, `${webSdkInstance.getName()}.js`),srcFileContent)
  } )
})


  describe('Deploy webSdk test suite', () => {
    test('all webSdk files are deployed successfully', async () => {
      const srcFileContent = getSiteConfig.globalConf 
      fs.readFileSync.mockReturnValue(srcFileContent)
      let spy = jest.spyOn(webSdkInstance, 'deployUsingToolkit')
      await webSdkInstance.deploy(apiKey, getSiteConfig, siteDomain)
      expect(spy.mock.calls.length).toBe(1)
      expect(spy).toHaveBeenNthCalledWith(1, apiKey, getSiteConfig, srcFileContent)
      })
})
