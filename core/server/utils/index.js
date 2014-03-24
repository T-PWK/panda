(function () {
    'use strict';

    /**
     * Check if `path` looks absolute.
     *
     * @param {String} path
     * @return {Boolean}
     * @api private
     */

    module.exports.isAbsolute = function(path){
        if ('/' == path[0]) return true;
        if (':' == path[1] && '\\' == path[2]) return true;
        if ('\\\\' == path.substring(0, 2)) return true; // Microsoft Azure absolute path
    };

    module.exports.randomValue = function (howMany, chars) {
        chars = chars || "abcdefghijklmnopqrstuwxyz0123456789";
        var rnd = require('crypto').randomBytes(howMany),
            value = new Array(howMany),
            len = chars.length;

        for (var i = 0; i < howMany; i++) {
            value[i] = chars[rnd[i] % len];
        }
        return value.join('');
    };

}());