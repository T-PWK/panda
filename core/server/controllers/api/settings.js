(function () {
    'use strict';

    var cfg     = require('nconf'),
        _       = require('underscore'),
        parse   = require('url').parse;

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

        _.each(req.body, function (value, property) {
            switch (property) {
                case 'title': cfg.set('app:title', value); break;
                case 'description': cfg.set('app:description', value); break;
                case 'postsPerPage': cfg.set('app:postsPerPage', +value); break;
            }
        });

        module.exports.index(req, res);
    };

}());