var when        = require('when'),
    debug       = require('debug')('panda:userprovider'),
    User        = require('./user-model');

var UserProvider = module.exports = function () {};

UserProvider.prototype.init = function () {
    debug('initialization');

    // var deferred = when.defer();

    // User.create({
    //     name: 'Tom Pawlak',
    //     email: 'tompwk@gmail.com',
    //     image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjZWVlIj48L3JlY3Q+PHRleHQgdGV4dC1hbmNob3I9Im1pZGRsZSIgeD0iMzIiIHk9IjMyIiBzdHlsZT0iZmlsbDojYWFhO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjEycHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+NjR4NjQ8L3RleHQ+PC9zdmc+'
    // }, function (argument) {
    //     deferred.resolve();
    // })

    // return deferred.promise;

    return when();
};

UserProvider.prototype.findLeadUser = function () {
    debug('find lead user');
    return when.resolve({});
}