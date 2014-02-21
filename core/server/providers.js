var when            = require('when'),
    mongoose        = require('mongoose'),
    cfg             = require('nconf'),
    PostProvider    = require('./services/postprovider'),
    ConfigProvider  = require('./services/configprovider'),
    configProvider  = new ConfigProvider(),
    postProvider    = new PostProvider();

function initMongoDB () {
    var deferred    = when.defer(),
        db          = mongoose.connection;

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
    configProvider: configProvider
};

module.exports.init = function () {
    var promise = ('mongo' === cfg.get('database:type'))
            ? when(initMongoDB())
            : when();
        
    return promise
        .then(function () {
            return when.join(postProvider.init(), configProvider.init());
        });
}