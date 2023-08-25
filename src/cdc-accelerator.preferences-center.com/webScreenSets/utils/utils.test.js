import utils from './utils'

describe('Utils: utils.getConfigPreferencesCenter()', () => {
    it('should return default value when window.gigya is not defined', () => {
        const defaultValue = 'default'
        expect(utils.getConfigPreferencesCenter('configName', defaultValue)).toBe(defaultValue)
    })

    it('should return default value when window.gigya.thisScript.globalConf.webScreenSets is not defined', () => {
        const defaultValue = 'default'
        window.gigya = {
            thisScript: {
                globalConf: {},
            },
        }
        expect(utils.getConfigPreferencesCenter('configName', defaultValue)).toBe(defaultValue)
    })

    it('should return default value when window.gigya.thisScript.globalConf.preferencesCenter[configName] is not defined', () => {
        const defaultValue = 'default'
        window.gigya = {
            thisScript: {
                globalConf: {
                    preferencesCenter: {},
                },
            },
        }
        expect(utils.getConfigPreferencesCenter('configName', defaultValue)).toBe(defaultValue)
    })

    it('should return default value when window.gigya.thisScript.globalConf.preferencesCenter[configName] is defined', () => {
        const defaultValue = 'default'
        const configName = 'configName'
        const configValue = 'configValue'
        window.gigya = {
            thisScript: {
                globalConf: {
                    preferencesCenter: {
                        [configName]: configValue,
                    },
                },
            },
        }
        expect(utils.getConfigPreferencesCenter(configName, defaultValue)).toBe(configValue)
    })
})
