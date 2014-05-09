(function () {
    "use strict";

    var when = require('when');

    module.exports = {
        start: function () {
            return when.resolve().delay(1000);
        },
        stop: function () {
            return when.resolve().delay(1000);
        }
    };

    require('pkginfo')(module, ['version', 'description', 'name', 'author']);

}());