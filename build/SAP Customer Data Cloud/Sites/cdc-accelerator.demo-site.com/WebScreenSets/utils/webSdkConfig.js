'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports['default'] = void 0;
var _default = (exports['default'] = {
    get: function get(configName, defaultValue) {
        try {
            var properties = configName.split('.');
            return properties.reduce(function (acc, prop) {
                return acc[prop] || defaultValue;
            }, gigya.thisScript.globalConf);
        } catch (e) {
            return defaultValue;
        }
    }
});
