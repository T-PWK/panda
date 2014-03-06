var when        = require('when'),
    debug       = require('debug')('panda:userprovider'),
    User        = require('./user-model');

var UserProvider = module.exports = function () {};

UserProvider.prototype.init = function () {
    debug('initialization');

    return when.resolve();
};

UserProvider.prototype.findLeadUser = function () {
    debug('find lead user');

    return User.findOne({ lead: true }).exec();
};