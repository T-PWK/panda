(function () {
    'use strict';

    var when                = require('when'),
        mongoose            = require('mongoose'),
        cfg                 = require('nconf'),
        themesProvider      = require('./services/themesprovider'),
        redirectsProvider   = new (require('./services/redirectsprovider'))(),
        pluginService       = new (require('./services/pluginservice'))(),
        configProvider      = new (require('./services/configprovider'))(),
        postProvider        = new (require('./services/postprovider'))(),
        userProvider        = new (require('./services/userprovider'))(),
        imageProvider       = new (require('./services/imageprovider'))(cfg.get('admin:images'));

    function initMongoDB() {
        var deferred = when.defer(),
            db = mongoose.connection;

        mongoose.connect(cfg.get('database:connection:uri'));

        db.once('open', function () {
            deferred.resolve();
        });

        db.once('error', function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }

    module.exports = {
        postProvider:       postProvider,
        configProvider:     configProvider,
        userProvider:       userProvider,
        themesProvider:     themesProvider,
        imageProvider:      imageProvider,
        redirectsProvider:  redirectsProvider,
        pluginService:      pluginService
    };

    module.exports.init = function () {
        // Initialize database connection first if using MongoDB
        var promise = ('mongo' === cfg.get('database:type')) ? when(initMongoDB()) : when.resolve();

        return promise
            .then(function () {

                // Initialize configuration provider and read database configurations before any other provider
                return configProvider.init();
            })
            .then(function () {

                // Initialize all other providers
                return when.join(
                    pluginService.init(),
                    postProvider.init(),
                    userProvider.init(),
                    themesProvider.init(),
                    imageProvider.init()
                );
            });
    };

})();