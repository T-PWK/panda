(function () {
    'use strict';

    var cfg                 = require('nconf'),
        RedirectsProvider   = 'memory' === cfg.get('database:type') ? require('./redirectsprovider-memory')
            : require('./redirectsprovider-mongo');

    module.exports = new RedirectsProvider();
})();
