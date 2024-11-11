'use strict';
var _webSdkConfig = _interopRequireDefault(require('./webSdkConfig'));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}
function _typeof(o) {
    '@babel/helpers - typeof';
    return (
        (_typeof =
            'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function (o) {
                      return typeof o;
                  }
                : function (o) {
                      return o && 'function' == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? 'symbol' : typeof o;
                  }),
        _typeof(o)
    );
}
function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
        Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _toPropertyKey(t) {
    var i = _toPrimitive(t, 'string');
    return 'symbol' == _typeof(i) ? i : String(i);
}
function _toPrimitive(t, r) {
    if ('object' != _typeof(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
        var i = e.call(t, r || 'default');
        if ('object' != _typeof(i)) return i;
        throw new TypeError('@@toPrimitive must return a primitive value.');
    }
    return ('string' === r ? String : Number)(t);
}

describe('Utils: webSdkConfig.get()', function () {
    it('should return default value when window.gigya is not defined', function () {
        var defaultValue = 'default';
        expect(_webSdkConfig['default'].get('configName', defaultValue)).toBe(defaultValue);
    });

    it('should return default value when window.gigya.thisScript.globalConf.webScreenSets is not defined', function () {
        var defaultValue = 'default';
        window.gigya = {
            thisScript: {
                globalConf: {}
            }
        };
        expect(_webSdkConfig['default'].get('configName', defaultValue)).toBe(defaultValue);
    });

    it('should return default value when window.gigya.thisScript.globalConf[configName] is defined', function () {
        var defaultValue = 'default';
        var configName = 'configName';
        var configValue = 'configValue';
        window.gigya = {
            thisScript: {
                globalConf: _defineProperty({}, configName, configValue)
            }
        };
        expect(_webSdkConfig['default'].get(configName, defaultValue)).toBe(configValue);
    });

    it('should support nested properties', function () {
        var defaultValue = 'default';
        var nestedConfigName = 'brand.data.initialAppSourceCode';
        var nestedConfigSplit = nestedConfigName.split('.');
        var configValue = 'SANDBOXPREFERENCESCENTER';
        window.gigya = {
            thisScript: {
                globalConf: _defineProperty({}, nestedConfigSplit[0], _defineProperty({}, nestedConfigSplit[1], _defineProperty({}, nestedConfigSplit[2], configValue)))
            }
        };
        expect(_webSdkConfig['default'].get(nestedConfigName, defaultValue)).toBe(configValue);
    });
});
