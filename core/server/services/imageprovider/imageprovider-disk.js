// ImageProvider using local disk

(function(){
    'use strict';

    var cfg     = require('nconf'),
        when    = require('when');

    var ImageProvider = function () {};

    ImageProvider.prototype.init = function () {
        return when.resolve();
    };

    module.exports = ImageProvider;

})();