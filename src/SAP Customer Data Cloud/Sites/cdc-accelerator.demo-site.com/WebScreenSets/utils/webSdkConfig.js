export default {
    get(configName, defaultValue) {
        try {
            const properties = configName.split('.')
            return properties.reduce((acc, prop) => acc[prop] || defaultValue, gigya.thisScript.globalConf)
        } catch (e) {
            return defaultValue
        }
    },
}
