(function () {
    'use strict';

    var cfg         = require('nconf'),
        when        = require('when'),
        _           = require('underscore'),
        parse       = require('url').parse,
        provider    = require('../../providers').configProvider,
        mapping     = {
            title:'app:title',
            description:'app:description',
            postsPerPage:'app:postsPerPage'
        };

    module.exports.index = function (req, res) {
        var settings = {
                title:          cfg.get('app:title'),
                description:    cfg.get('app:description'),
                postsPerPage:   cfg.get('app:postsPerPage')
            },
            url = parse(cfg.get('url'));

        settings.host = url.hostname;

        res.json(settings);
    };

    module.exports.create = function (req, res) {
        var storage = [];

        _.each(req.body, function (value, property) {
            if (property in mapping) {
                cfg.set(mapping[property], value);
                //storage.push()
                //TODO: push to storage
            }
        });

        module.exports.index(req, res);
    };

}());