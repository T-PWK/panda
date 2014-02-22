var when        = require('when'),
    nodefn      = require('when/node/function'),
    path        = require('path'),
    fs          = require('fs'),
    cfg         = require('nconf'),
    _           = require('underscore');

var UserProvider = module.exports = function () {
    this.users = {};
    this.lead = null;
};

UserProvider.prototype.init = function () {
    var that        = this,
        usersFile   = path.join(cfg.get('paths:data'), 'users.json'),
        loadUsers   = nodefn.call(fs.readFile, usersFile);

    return loadUsers
        .then(function (data) {
            return that.users = JSON.parse(data);
        })
        .then(function (users) {
            _.each(users, function (user) {
                if(user.lead) {
                    that.lead = user;
                }
            });
        })
};

UserProvider.prototype.findLeadUser = function () {
    return when.resolve(this.lead);
}