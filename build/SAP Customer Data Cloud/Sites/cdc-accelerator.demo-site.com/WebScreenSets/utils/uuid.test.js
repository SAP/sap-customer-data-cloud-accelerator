'use strict';
var _uuid = _interopRequireDefault(require('./uuid'));
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

describe('Utils: uuid.generate()', function () {
    it('should generate a string', function () {
        var result = _uuid['default'].generate();
        expect(_typeof(result)).toBe('string');
    });

    it('should generate a string of length 36', function () {
        var result = _uuid['default'].generate();
        expect(result.length).toBe(36);
    });

    it('should generate a string in UUID format', function () {
        var result = _uuid['default'].generate();
        var uuidFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(result).toMatch(uuidFormat);
    });

    it('should generate unique UUIDs', function () {
        var uuid1 = _uuid['default'].generate();
        var uuid2 = _uuid['default'].generate();
        expect(uuid1).not.toBe(uuid2);
    });
});
