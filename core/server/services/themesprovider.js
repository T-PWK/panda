(function () {
    "use strict";

    var _               = require('lodash'),
        _s              = require('underscore.string'),
        cfg             = require('nconf'),
        when            = require('when'),
        node            = require('when/node'),
        readDir         = node.lift(require('fs').readdir),
        join            = require('path').join,
        configProvider;

    var ThemesProvider = function () {
        this.themes = [];
        this.adminThemes = [];
        this.activeTheme;
        this.activeAdminTheme;
    };

    ThemesProvider.prototype.init = function () {
        var that = this;

        // Get reference to configProvider after initialization
        configProvider  = require('../providers').configProvider;

        return when
            .all([
                readDir(join(cfg.get('paths:clientStatic'), 'css/theme')).then(namesToThemes),
                readDir(cfg.get('paths:themes')).then(namesToThemes)
            ])
            .spread(function (adminThemes, themes) {
                that.themes = themes;
                that.adminThemes = adminThemes;

                that.selectActiveTheme();
                that.selectActiveAdminTheme();
            });
    };

    ThemesProvider.prototype.getActiveTheme = function() {
        return this.activeTheme;
    }

    ThemesProvider.prototype.getActiveAdminTheme = function() {
        return this.activeAdminTheme;
    }

    ThemesProvider.prototype.selectActiveTheme = function () {
        selectThemes(this.themes, cfg.get('theme:name'));
        this.activeTheme = _.find(this.themes, { active:true });
    };

    ThemesProvider.prototype.selectActiveAdminTheme = function () {
        selectThemes(this.adminThemes, cfg.get('admin:theme'));
        this.activeAdminTheme = _.find(this.adminThemes, { active:true });
    };

    ThemesProvider.prototype.getAdminThemes = function () {
        return when.resolve(this.adminThemes);
    };

    ThemesProvider.prototype.getThemes = function () {
        return when.resolve(this.themes);
    };

    ThemesProvider.prototype.checkTheme = function (id) {
        var theme = _.find(this.themes, { id:id });
        return !!theme ? when.resolve(theme) : when.reject();
    };

    ThemesProvider.prototype.checkAdminTheme = function (id) {
        var theme = _.find(this.adminThemes, { id:id });
        return !!theme ? when.resolve(theme) : when.reject();
    };

    ThemesProvider.prototype.updateTheme = function (id) {
        return this.checkTheme(id)
            .tap(function (theme) {
                return configProvider.saveConfig('theme:name', theme.id);
            })
            .tap(function (theme) {
                cfg.set('theme:name', theme.id);
                cfg.notify('set:theme:name', theme.id);
            });
    };

    ThemesProvider.prototype.updateAdminTheme = function (id) {
        return this.checkAdminTheme(id)
            .tap(function (theme) {
                return configProvider.saveConfig('admin:theme', id);
            })
            .tap(function () {
                cfg.set('admin:theme', id);
                cfg.notify('set:admin:theme', id);
            });
    };

    function selectThemes (themes, id) {
        _.each(themes, function (theme) {
            theme.active = theme.id == id;
        });
    }

    function nameToTheme (name) {
        var id = name.replace(/^(\w+)(\.\w+)*$/, '$1');
        return {
            id: id,
            name: _s.titleize(_s.humanize(id)),
            data: name
        };
    }

    function namesToThemes (fileNames) {
        return fileNames.map(nameToTheme);
    }

    var themesProvider = new ThemesProvider();

    cfg.on('set:theme:name', themesProvider.selectActiveTheme.bind(themesProvider));
    cfg.on('set:admin:theme', themesProvider.selectActiveAdminTheme.bind(themesProvider));

    module.exports = themesProvider;

}());