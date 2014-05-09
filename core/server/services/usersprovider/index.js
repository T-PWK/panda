(function () {
    'use strict';

    var cfg             = require('nconf'),
        UsersProvider   = 'memory' === cfg.get('database:type') ? require('./userprovider-memory')
            : require('./userprovider-mongo');

    module.exports = new UsersProvider();
})();