(function () {
    'use strict';

    var cfg                 = require('nconf'),
        when                = require('when'),
        _                   = require('underscore'),
        url                 = require('url'),
        provider            = require('../../providers').configProvider,
        debug               = require('debug')('panda:api:settings'),
        processors          = {},
        propertyMap         = {},
        allowedReadSettings = ['app:postUrl', 'app:pageUrl'];

    propertyMap = {
        title:'app:title',
        description:'app:description',
        postsPerPage:'app:postsPerPage',
        url: 'url'
    };

    processors.host = function (properties, name, value) {
        properties.url = url.format({ host:value, protocol:'http' });
    };

    module.exports.index = function (req, res) {
        debug('reading basic settings');

        var urlCfg      = url.parse(cfg.get('url')),
            settings    = {
                host:           urlCfg.host,
                title:          cfg.get(propertyMap.title),
                description:    cfg.get(propertyMap.description),
                postsPerPage:   cfg.get(propertyMap.postsPerPage)
            };

        res.json(settings);
    };

    module.exports.show = function (req, res) {
        debug('reading configuration value %j', req.param.setting);

        return (req.setting) ? res.json({ key: req.params.setting, value: req.setting }) : res.send(404);
    };

    module.exports.load = function (id, fn) {
        if (_.contains(allowedReadSettings, id)) {
            fn(null, cfg.get(id));
        } else {
            fn();
        }
    };

    module.exports.create = function (req, res) {
        var promises = [];

        // Properties pre-processing
        if (_.size(processors)) {
            _.each(req.body, function (value, property) {
                if (property in processors) {
                    processors[property](req.body, property, value);
                }
            });
        }

        _.each(req.body, function (value, property) {

            if (property in propertyMap && cfg.get(propertyMap[property]) !== value) {

                debug('updating setting value %j : %j', propertyMap[property], value);

                promises.push(
                    provider.saveConfig(propertyMap[property], value)
                        .then(cfg.set.bind(cfg, propertyMap[property], value))
                );
            }
        });

        when.all(promises)
            .done(
                module.exports.index.bind(null, req, res),
                res.send.bind(res, 500)
            );
    };

}());