(function () {
    'use strict';

    var cfg = require('nconf'),
        ConfigProvider = 'memory' === cfg.get('database:type') ? require('./configprovider-memory')
        : require('./configprovider-mongo');

    module.exports = new ConfigProvider();

})();
