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
        debug('reading configuration value %j', req.params.id);

        return (req.setting) ? res.json({ key: req.params.id, value: req.setting }) : res.send(404);
    };

    module.exports.load = function (req, res, fn, id) {
        if (_.contains(allowedReadSettings, id)) {
            req.setting = cfg.get(id);
        }
        fn();
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
                        .then(function () {
                            cfg.set(propertyMap[property], value);
                            cfg.notify('set:' + propertyMap[property]);
                        })
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