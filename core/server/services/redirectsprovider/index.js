(function () {
    'use strict';

    var cfg = require('nconf');

    module.exports = 'memory' === cfg.get('database:type') ?
        require('./redirectsprovider-memory')
        : require('./redirectsprovider-mongo');

})();
