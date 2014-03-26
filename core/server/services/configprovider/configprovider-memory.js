(function () {
    'use strict';

    var when = require('when'),
        path = require('path'),
        fs = require('fs'),
        node = require('when/node'),
        cfg = require('nconf'),
        _ = require('underscore'),
        idGen = require('../idgenerator');

    var ConfigProvider = module.exports = function () {
        this.redirects = [];
    };

    ConfigProvider.prototype.init = function () {
        var that = this,
            dataFile = path.join(cfg.get('paths:data'), 'redirects.json'),
            loadData = node.call(fs.readFile, dataFile);

        return loadData
            .then(function (redirects) {
                that.redirects = JSON.parse(redirects);
            });
    };

    ConfigProvider.prototype.findAllRedirects = function () {
        return when.resolve(this.redirects);
    };

    ConfigProvider.prototype.findRedirectByUrl = function (url) {
        return when.resolve(_.findWhere(this.redirects, { from: url }));
    };

    ConfigProvider.prototype.findRedirectById = function (id) {
        return when.resolve(_.findWhere(this.redirects, { id: id }));
    };

    ConfigProvider.prototype.deleteRedirect = function (id) {
        var index = -1;

        _.find(this.redirects, function (item, idx) {
            if (item.id === id) {
                index = idx;
                return true;
            }
        });

        if (index >= 0) {
            this.redirects.splice(index, 1);
        }
        return when.resolve({success: index >= 0});
    };

    ConfigProvider.prototype.updateRedirect = function (id, properties) {
        var redirect = _.findWhere(this.redirects, { id: id });

        if (redirect) {
            _.extend(redirect,
                { updatedAt: new Date() },
                _.pick(properties, 'from', 'to', 'type'));

            return when.resolve();
        }
        else return when.reject();
    };

    ConfigProvider.prototype.createRedirect = function (properties) {
        properties = _.pick(properties, 'from', 'to', 'type');

        if (_.findWhere(this.redirects, { from: properties.from }) || _.size(properties) < 3) {
            return when.reject();
        }

        _.extend(properties, {
            id: idGen(),
            createdAt: new Date(),
            updatedAt: new Date()
        });

        this.redirects.push(properties);
        return when.resolve();
    };

})();