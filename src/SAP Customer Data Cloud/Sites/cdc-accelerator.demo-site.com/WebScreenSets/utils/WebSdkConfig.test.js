import webSdkConfig from './webSdkConfig'

describe('Utils: webSdkConfig.get()', () => {
    it('should return default value when window.gigya is not defined', () => {
        const defaultValue = 'default'
        expect(webSdkConfig.get('configName', defaultValue)).toBe(defaultValue)
    })

    it('should return default value when window.gigya.thisScript.globalConf.webScreenSets is not defined', () => {
        const defaultValue = 'default'
        window.gigya = {
            thisScript: {
                globalConf: {},
            },
        }
        expect(webSdkConfig.get('configName', defaultValue)).toBe(defaultValue)
    })

    it('should return default value when window.gigya.thisScript.globalConf[configName] is defined', () => {
        const defaultValue = 'default'
        const configName = 'configName'
        const configValue = 'configValue'
        window.gigya = {
            thisScript: {
                globalConf: {
                    [configName]: configValue,
                },
            },
        }
        expect(webSdkConfig.get(configName, defaultValue)).toBe(configValue)
    })

    it('should support nested properties', () => {
        const defaultValue = 'default'
        const nestedConfigName = 'brand.data.initialAppSourceCode'
        const nestedConfigSplit = nestedConfigName.split('.')
        const configValue = 'SANDBOXPREFERENCESCENTER'
        window.gigya = {
            thisScript: {
                globalConf: {
                    [nestedConfigSplit[0]]: {
                        [nestedConfigSplit[1]]: {
                            [nestedConfigSplit[2]]: configValue,
                        },
                    },
                },
            },
        }
        expect(webSdkConfig.get(nestedConfigName, defaultValue)).toBe(configValue)
    })
})
