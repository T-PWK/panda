(function () {
    "use strict";

    var when = require('when');

    require('pkginfo')(module, ['version', 'description', 'name', 'author']);

    module.exports.start = function () {
        return when.resolve().delay(1000);
    };

    module.exports.stop = function () {
        return when.resolve().delay(1000);
    };

}());