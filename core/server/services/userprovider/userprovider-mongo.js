(function () {
    'use strict';

    var when        = require('when'),
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

    module.exports = UserProvider;

}());