(function () {
    'use strict';

    var when        = require('when'),
        node        = require('when/node'),
        _           = require('underscore'),
        crypt       = require('bcryptjs'),
        genSalt     = node.lift(crypt.genSalt),
        hash        = node.lift(crypt.hash),
        debug       = require('debug')('panda:usersProvider'),
        User        = require('./../../models/mongoose/user');

    var UserProvider = function () {};

    UserProvider.prototype.init = function () {
        debug('initialization');
    };

    UserProvider.prototype.findLeadUser = function () {
        debug('finding lead user');

        return User.findOne({ lead: true }).exec();
    };

    UserProvider.prototype.findAllUsers = function () {
        debug('finding all user');

        return User.find().exec();
    };

    UserProvider.prototype.findByEmail = function (email) {
        debug('finding user by email %j', email);

        return User.findOne({ email: email }).exec();
    };

    UserProvider.prototype.findById = function (id) {
        debug('finding user by id %j', id);

        return User.findById(id).exec();
    };

    UserProvider.prototype.updateUser = function (id, properties) {
        var update = _.extend(
            { updatedAt: new Date() },
            _.pick(properties, 'name', 'email', 'image', 'website', 'bio', 'location')
        );

        debug('updating user %j : %j', id, update);

        return User.findByIdAndUpdate(id, update).exec();
    };

    UserProvider.prototype.updatePassword = function (id, password) {
        debug('updating password for %j', id);

        return genSalt(10)
            .then(function (salt) {
                return hash(password, salt);
            })
            .then(function (hash) {
                return User.findByIdAndUpdate(id, { updatedAt: new Date(), password: hash }).exec();
            });
    };

    module.exports = UserProvider;

}());