(function () {
    "use strict";

    var when = require('when'),
        _ = require('lodash');

    module.exports = function () {
        _.mixin({ 'startsWith': startsWith }, { chain: false });
        _.mixin({ 'endsWith': endsWith }, { chain: false });
        _.mixin({ 'isEmpty': isEmpty }, { chain: false });
        _.mixin({ 'isBlank': isBlank }, { chain: false });

        return when.resolve();
    };

    function startsWith(string, prefix, position) {
        position = position || 0;
        return string.indexOf(prefix, position) === position;
    }

    function endsWith(string, suffix) {
        return string.indexOf(suffix, string.length - suffix.length) !== -1;
    }

    function isEmpty(string) {
        return (!string || 0 === string.length);
    }

    function isBlank(string) {
        return (!string || 0 === string.length || /^\s*$/.test(string));
    }

}());