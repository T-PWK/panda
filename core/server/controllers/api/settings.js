(function () {
    'use strict';

    var cfg             = require('nconf'),
        when            = require('when'),
        _               = require('underscore'),
        parse           = require('url').parse,
        provider        = require('../../providers').configProvider,
        mapping         = {
            title:'app:title',
            description:'app:description',
            postsPerPage:'app:postsPerPage'
        },
        allowedSettings = ['app:postUrl', 'app:pageUrl'];

    module.exports.index = function (req, res) {
        var settings = {
                title:          cfg.get(mapping.title),
                description:    cfg.get(mapping.description),
                postsPerPage:   cfg.get(mapping.postsPerPage)
            },
            url = parse(cfg.get('url'));

        settings.host = url.hostname;

        res.json(settings);
    };

    module.exports.show = function (req, res) {
        var response = {
            key: req.params.setting,
            value: req.setting
        };
        return (req.setting) ? res.json(response) : res.send(404);
    };

    module.exports.load = function (id, fn) {
        if (_.contains(allowedSettings, id)) {
            fn(null, cfg.get(id));
        } else {
            fn();
        }
    };

    module.exports.create = function (req, res) {
        var promises = [];

        _.each(req.body, function (value, property) {

            console.info('checking  ', property)

            if (property in mapping && cfg.get(mapping[property]) !== value) {
                console.info('updating ', mapping[property])
                promises.push(
                    provider.saveConfig(mapping[property], value)
                        .then(cfg.set.bind(cfg, mapping[property], value))
                );
            }
        });

        when.all(promises).done(
            module.exports.index.bind(null, req, res),
            res.send.bind(res, 500)
        );
    };

}());