(function () {
    'use strict';

    var FlakeIdGen = require('flake-idgen'),
        format = require('biguint-format'),
        generator = new FlakeIdGen();

    module.exports = function () {
        return format(generator.next(), 'dec');
    };

})();