var when            = require('when'),
    mongoose        = require('mongoose'),
    cfg             = require('nconf'),
    PostProvider    = require('./services/postprovider'),
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
    postProvider: postProvider
};

module.exports.init = function () {
    var promise = ('mongo' === postProvider.type)
        ? when(initMongoDB())
        : when();

    

    return promise.then(postProvider.init.bind(postProvider));
}