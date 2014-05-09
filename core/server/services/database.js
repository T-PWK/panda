(function () {
    "use strict";

    var cfg         = require('nconf'),
        when        = require('when'),
        mongoose    = require('mongoose');

    module.exports.init = function () {
        var promise = (function () {
            switch (cfg.get('database:type')) {
                case 'mongo':
                    return when.resolve(initMongoDB());
                /* case '???'
                    // Extension point for other database providers
                    return when.resolve(); */
                default :
                    return when.resolve();
            }
        }());

        return promise;
    };

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

}());