(function () {
    'use strict';

    var when        = require('when'),
        _           = require('underscore'),
        crypt       = require('bcryptjs'),
        debug       = require('debug')('panda:userprovider'),
        User        = require('./../../models/mongoose/user');

    var UserProvider = function () {};

    UserProvider.prototype.init = function () {
        debug('initialization');

        return when.resolve();
    };

    UserProvider.prototype.findLeadUser = function () {
        debug('find lead user');

        return User.findOne({ lead: true }).exec();
    };

    UserProvider.prototype.findByEmail = function (email) {
        debug('find user by email');

        console.info('searching user by email: ', email);

        return User.findOne({ email: email }).exec();
    };

    UserProvider.prototype.findById = function (id) {
        return User.findById(id).exec();
    };

    UserProvider.prototype.updateUser = function (id, properties) {
        var update = _.extend(
            { updatedAt: new Date() },
            _.pick(properties, 'name', 'email', 'image', 'website', 'bio', 'location')
        );

        return User.findByIdAndUpdate(id, update).exec();
    };

    UserProvider.prototype.updatePassword = function (id, password) {
        var deferred = when.defer(), update;

        crypt.genSalt(10, function (err, salt) {
            if (err) {
                return deferred.reject(err);
            }

            crypt.hash(password, salt, function (err, hash) {
                if (err) {
                    return deferred.reject(err);
                }

                deferred.resolve(
                    User.findByIdAndUpdate(id, { updatedAt: new Date(), password: hash }).exec()
                );
            });
        });
        return deferred.promise;
    };

    module.exports = UserProvider;

}());