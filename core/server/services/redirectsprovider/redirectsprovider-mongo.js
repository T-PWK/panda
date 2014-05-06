(function () {
    'use strict';

    var when        = require('when'),
        _           = require('underscore'),
        debug       = require('debug')('panda:redirectsProvider'),
        Redirect    = require('./../../models/mongoose/redirect');

    var RedirectsProvider = module.exports = function () {};

    RedirectsProvider.prototype.init = function () {
        debug('initialization');

        return when.resolve();
    };

    RedirectsProvider.prototype.findAllRedirects = function (properties) {
        properties = properties || {};

        return Redirect
            .find()
            .sort(properties.sortBy || undefined)
            .select(properties.select || undefined)
            .exec();
    };

    RedirectsProvider.prototype.findRedirectByUrl = function (path) {
        debug('find redirect by path', path);

        return Redirect
            .findOne({ from: path })
            .select('type to')
            .exec();
    };

    RedirectsProvider.prototype.findRedirectById = function (id) {
        return Redirect.findById(id).exec();
    };

    RedirectsProvider.prototype.deleteRedirect = function (id) {
        return Redirect.findByIdAndRemove(id).exec();
    };

    RedirectsProvider.prototype.updateRedirect = function (id, properties) {
        var update = _.extend(
            { updatedAt: new Date() },
            _.pick(properties, 'from', 'to', 'type')
        );

        debug('updating redirect %j : %j', id, update);

        return Redirect.findByIdAndUpdate(id, update).exec();
    };

    RedirectsProvider.prototype.createRedirect = function (properties) {
        return Redirect.create(_.pick(properties, 'from', 'to', 'type'));
    };

})();