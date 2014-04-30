// ImageProvider using local disk

(function () {
    'use strict';

    var when = require('when');

    var ImageProvider = function () {
    };

    ImageProvider.prototype.init = function () {
        return when.resolve();
    };

    ImageProvider.prototype.all = function () {
        return when.resolve([]);
    };


    module.exports = ImageProvider;

})();