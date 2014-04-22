(function () {
    'use strict';

    var cfg             = require('nconf'),
        PostProvider    = 'memory' === cfg.get('database:type') ? require('./postprovider-memory')
            : require('./postprovider-mongo');

    if (cfg.get('cache:posts:enable')) {
        var cachedPostProvider = require('./postprovider-cache');

        PostProvider = cachedPostProvider(PostProvider);
    }

    module.exports = PostProvider;

})();