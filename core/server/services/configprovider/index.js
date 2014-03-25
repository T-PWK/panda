(function () {
    'use strict';

    var cfg = require('nconf');

    module.exports = 'memory' === cfg.get('database:type') ? require('./configprovider-memory')
        : require('./configprovider-mongo');

})();
