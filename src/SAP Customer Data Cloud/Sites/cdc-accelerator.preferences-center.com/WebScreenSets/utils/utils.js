export default {
    getConfigPreferencesCenter(configName, defaultValue) {
        try {
            return typeof gigya.thisScript.globalConf.preferencesCenter[configName] !== 'undefined' ? gigya.thisScript.globalConf.preferencesCenter[configName] : defaultValue
        } catch (e) {
            return defaultValue
        }
    },
}
