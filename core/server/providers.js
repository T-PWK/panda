(function () {
    'use strict';

    var when            = require('when'),
        mongoose        = require('mongoose'),
        cfg             = require('nconf'),
        PostProvider    = require('./services/postprovider'),
        ConfigProvider  = require('./services/configprovider'),
        UserProvider    = require('./services/userprovider'),
        themesProvider  = require('./services/themesprovider'),
        ImageProvider   = require('./services/imageprovider'),
        PluginService   = require('./services/pluginservice'),
        pluginService   = new PluginService(),
        configProvider  = new ConfigProvider(),
        postProvider    = new PostProvider(),
        userProvider    = new UserProvider(),
        imageProvider   = new ImageProvider(cfg.get('admin:images'));

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
        postProvider: postProvider,
        configProvider: configProvider,
        userProvider: userProvider,
        themesProvider: themesProvider,
        imageProvider: imageProvider
    };

    module.exports.init = function () {
        var promise = ('mongo' === cfg.get('database:type')) ? when(initMongoDB()) : when.resolve();

        return promise
            .then(function () {
                return when.join(
                    pluginService.init(),
                    configProvider.init(),
                    postProvider.init(),
                    userProvider.init(),
                    themesProvider.init(),
                    imageProvider.init()
                );
            });
    };

})();