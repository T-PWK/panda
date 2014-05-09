// This file is responsible for performing modules initialization like configuration load,
// providers initialization, application server startup etc.
(function () {
    'use strict';

    var colors  = require('colors'),
        when    = require('when');

    function startPanda (app) {
        when
            .resolve(require('./server/init')())
            .then(function () {
                // Configuration initialization
                return require('./server/config').init();
            })
            .then(function () {
                // Database layer initialization
                return require('./server/services/database').init();
            })
            .then(function () {
                // Configuration service initialization
                return require('./server/services/configprovider').init();
            })
            .then(function () {
                // Initialization of other data providers
                return require('./server/providers').init();
            })
            .then(function () {
                var panda = require('./server');
                return panda(app);
            })
            .otherwise(function (err) {
                console.log(("Panda server initialization error " + err).red);
                console.log((err.stack).red);
            });
    }

    module.exports = startPanda;

}());