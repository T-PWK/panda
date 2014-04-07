(function () {
    'use strict';

    var cfg         = require('nconf'),
        fs          = require('fs'),
        _           = require('underscore'),
        _s          = require('underscore.string'),
        when        = require('when'),
        node        = require('when/node'),
        provider    = require('../../providers').configProvider,
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
    };

    module.exports.update = function (req, res) {
        readdir(themesDir)
            .then(namesToThemes)
            .then(checkThemes)
            .tap(provider.saveConfig.bind(provider, 'admin:theme'))
            .then(setAdminTheme)
            .done(
                res.json.bind(res),
                res.send.bind(res, 400)
            );

        function checkThemes (themes) {
            return _.findWhere(themes, {id: req.params.admin}) ? req.params.admin : when.reject();
        }

        function setAdminTheme (theme) {
            cfg.set('admin:theme', theme);
            cfg.notify('set:admin:theme', theme);
        }
    };

    function nameToTheme (name) {
        var id = name.replace(/^(\w+)(\.\w+)*$/, '$1');
        return {
            id: id,
            name: _s.titleize(_s.humanize(id))
        };
    }

    function namesToThemes (fileNames) {
        return fileNames.map(nameToTheme);
    }


}());

