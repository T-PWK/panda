(function () {
    'use strict';

    var when        = require('when'),
        _           = require('underscore'),
        debug       = require('debug')('panda:configprovider'),
        Redirect    = require('./redirect-model');

    var ConfigProvider = module.exports = function () {};

    ConfigProvider.prototype.init = function () {
        debug('initialization');

        return when.resolve();
    };

    ConfigProvider.prototype.findAllRedirects = function (properties) {
        properties = properties || {};

        return Redirect
            .find()
            .sort(properties.sortBy || undefined)
            .select(properties.select || undefined)
            .exec();
    };

    ConfigProvider.prototype.findRedirectByUrl = function (path) {
        debug('find redirect by path', path);

        return Redirect
            .findOne({ from: path })
            .select('type to')
            .exec();
    };

    ConfigProvider.prototype.findRedirectById = function (id) {
        return Redirect.findById(id).exec();
    };

    ConfigProvider.prototype.deleteRedirect = function (id) {
        return Redirect.findByIdAndRemove(id).exec();
    };

    ConfigProvider.prototype.updateRedirect = function (id, properties) {
        var update = _.extend(
            { updatedAt: new Date() },
            _.pick(properties, 'from', 'to', 'type')
        );

        debug('updating redirect %j : %j', id, update);

        return Redirect.findByIdAndUpdate(id, update).exec();
    };

    ConfigProvider.prototype.createRedirect = function (properties) {
        return Redirect.create(_.pick(properties, 'from', 'to', 'type'));
    };

})();