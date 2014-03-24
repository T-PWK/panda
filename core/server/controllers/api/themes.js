(function () {
    'use strict';

    var cfg                 = require('nconf'),
        setThemeConfig      = require('../../config').setTheme,
        updateThemeAssets   = require('../../middleware/static').updateThemeAssets,
        fs                  = require('fs'),
        _                   = require('underscore'),
        _s                  = require('underscore.string'),
        node                = require('when/node'),
        readdir             = node.lift(fs.readdir);

    module.exports.index = function (req, res) {
        readdir(cfg.get('paths:themes'))
            .then(namesToThemes)
            .tap(selectActive)
            .then(res.json.bind(res))
            .otherwise(res.send.bind(res, 500));

        function selectActive (themes) {
            var active = _.findWhere(themes, { id:cfg.get('theme:name') });
            if (active) {
                active.active = true;
            }
        }

        function nameToTheme (name) {
            return {
                id: name,
                name: _s.titleize(_s.humanize(name))
            };
        }

        function namesToThemes (fileNames) {
            return fileNames.map(nameToTheme);
        }
    };

    module.exports.update = function (req, res) {

        readdir(cfg.get('paths:themes'))
            .then(checkThemes)
            .then(updateThemeConfig)
            .done(
                res.json.bind(res),
                res.send.bind(res, 400)
            );

        function checkThemes (themes) {
            return (themes.indexOf(req.params.site) < 0) ? when.reject() : req.params.site;
        }

        function updateThemeConfig(theme) {
            setThemeConfig(theme);

            // Update theme views
            req.app.set('views', cfg.get('theme:paths:views'));

            // Update static files path
            updateThemeAssets();
        }
    };

}());