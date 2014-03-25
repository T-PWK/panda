(function () {
    'use strict';

    var flakeIdGen = require('flake-idgen'),
        format = require('biguint-format'),
        generator = new flakeIdGen();

    module.exports = function () {
        return format(generator.next(), 'dec');
    };

})();