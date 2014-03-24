(function () {
    'use strict';

    var cfg         = require('nconf'),
        fs          = require('fs'),
        _           = require('underscore'),
        _s          = require('underscore.string'),
        when        = require('when'),
        node        = require('when/node'),
        readdir     = node.lift(fs.readdir),
        join        = require('path').join,
        themesDir   = join(cfg.get('paths:clientStatic'), 'css/theme'); /* jshint -W030 */

    module.exports.index = function (req, res) {
        readdir(themesDir)
            .then(namesToThemes)
            .tap(selectActive)
            .done(
                res.json.bind(res),
                res.send.bind(res, 500)
            );

        function selectActive (themes) {
            var active = _.findWhere(themes, { id:cfg.get('admin:theme') });
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
        readdir(themesDir)
            .then(checkThemes)
            .then(setAdminTheme)
            .done(
                res.json.bind(res),
                res.send.bind(res, 400)
            );

        function checkThemes (themes) {
            return (themes.indexOf(req.params.admin) < 0) ? when.reject() : req.params.admin;
        }

        function setAdminTheme (theme) {
            cfg.set('admin:theme', req.params.admin);
        }
    };

}());

