(function () {
    "use strict";

    var when    = require('when'),
        _       = require('lodash');

    module.exports = function () {
        _.mixin({ 'startsWith': startsWith }, { chain: false });

        return when.resolve();
    };

    function startsWith(string, search, position) {
        position = position || 0;
        return string.indexOf(search, position) === position;
    }

}());