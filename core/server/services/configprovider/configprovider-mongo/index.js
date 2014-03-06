var when        = require('when'),
    mongoose    = require('mongoose'),
    cfg         = require('nconf'),
    debug       = require('debug')('panda:configprovider'),
    Redirect    = require('./redirect-model');

var ConfigProvider = module.exports = function () {};

ConfigProvider.prototype.init = function () {
    debug('initialization');

    return when.resolve();
};

ConfigProvider.prototype.findRedirectByUrl = function (path) {
    debug('find redirect by path', path);

    return Redirect
        .findOne({ from: path })
        .select('type to')
        .exec();
};