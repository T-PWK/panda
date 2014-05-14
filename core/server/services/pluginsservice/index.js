(function () {
    "use strict";

    var when            = require('when'),
        node            = require('when/node'),
        parallel        = require('when/parallel'),
        downsize        = require('downsize'),
        path            = require('path'),
        fs              = require('fs'),
        cfg             = require('nconf'),
        _               = require('lodash'),
        str             = require('underscore.string'),
        debug           = require('debug')('panda:pluginsService'),
        pluginDir       = cfg.get('paths:plugins'),
        configProvider;

    function PluginService() {
        this.active     = []; // Active plugin instances
        this.inactive   = []; // Inactive plugin descriptions
    }

    PluginService.prototype.init = function () {
        debug('initializing');

        configProvider = require('../../providers').configProvider;

        var self = this;

        return node.call(fs.readdir, pluginDir)
            .then(function (codes) {
                // Remove non-plugin files
                return _.without(codes, 'README', 'README.md');
            })
            .then(function (codes) {
                // Set all plugins as inactive and then enable the ones from the 'enabled' list
                _.forEach(codes, self.instantiatePlugin.bind(self));

                // From now on use plugin codes
                return _.pluck(self.inactive, 'code');
            })
            .then(function (codes) {
                // Returns list of available plugin codes ready to be started
                return _.intersection(codes, cfg.get('plugins:enabled') || []);
            })
            .then(function (codes) {
                // Convert list of codes into a list of plugin startup promises
                return when.all(_.map(codes, function (code) {
                    return self.start(code);
                }));
            });
    };

    PluginService.prototype.addInactive = function (plugin) {
        if (_.isArray(plugin)) {
            Array.prototype.push.apply(this.inactive, plugin);
        } else {
            this.inactive.push(plugin);
        }
    };

    PluginService.prototype.instantiatePlugin = function (code) {
        this.inactive.push(instantiatePlugin(code));
    };

    PluginService.prototype.stopAndPersist = function (code) {
        return this.stop(code)
            .tap(function () {
                var plugins = _.chain(cfg.get('plugins:enabled') || []).without(code).uniq().sort().value();
                cfg.set('plugins:enabled', plugins);

                return configProvider.saveConfig('plugins:enabled', plugins);
            });
    };

    PluginService.prototype.startAndPersist = function (code) {
        return this.start(code)
            .tap(function () {
                var plugins = _.chain(cfg.get('plugins:enabled') || []).push(code).uniq().sort().value();
                cfg.set('plugins:enabled', plugins);

                return configProvider.saveConfig('plugins:enabled', plugins);
            });
    };

    PluginService.prototype.stop = function (code) {
        debug('stopping plugin %j', code);

        var self    = this,
            plugin  = _.find(this.active, {code: code});

        if (!plugin) {
            return when.reject({code: code, msg: 'No active plugin'});
        }

        return when.resolve(plugin)
            .tap(function (plugin) {
                plugin.status = 'I';
            })
            .tap(function (plugin) {
                if (_.isFunction(plugin.stop)) {
                    return plugin.stop();
                }
            })
            .tap(function (plugin) {
                self.addInactive(_.remove(self.active, {code: plugin.code}));
            });
    };

    PluginService.prototype.start = function (code) {
        debug('starting plugin %j', code);

        var self    = this,
            plugin  = _.find(this.inactive, {code: code});

        if (!plugin) {
            return when.reject({code: code, msg: 'No inactive'});
        }

        return when.resolve(plugin)
            .tap(function (plugin) {
                plugin.status = 'A';
            })
            .tap(function (plugin) {
                if (_.isFunction(plugin.start)) {
                    return plugin.start();
                }
            })
            .tap(function (plugin) {
                self.active.push(plugin);
                _.remove(self.inactive, {code: plugin.code});
            });
    };

    PluginService.prototype.info = function () {
        return {
            active: _.map(this.active, properties),
            inactive: _.map(this.inactive, properties)
        };

        function properties(plugin) {
            return _.pick(plugin,
                'code', 'name', 'description', 'version', 'author', 'teaser', 'status', 'messages', 'configuration');
        }
    };

    PluginService.prototype.request = function (req, res, next) {
        return execute(this.active, 'request',  req, res).done(function (results) {
            if (!_.any(results)) {
                next();
            }
        });
    };

    PluginService.prototype.post = function (req, res) {
        return execute(this.active, 'post',  req, res);
    };

    PluginService.prototype.posts = function (req, res) {
        return execute(this.active, 'posts',  req, res);
    };

    PluginService.prototype.pageAction = function (name, req, res) {
        var actionName = 'page' + _.titleize(name);
        return _.chain(this.active)
            .filter(function (plugin) {
                return _.isFunction(plugin[actionName]);
            })
            .invoke(actionName, req, res)
            .value();
    };

    function codeToName(code) {
        return str.titleize(str.humanize(path.basename(code, '.js')));
    }

    function instantiatePlugin (code) {
        var instance = require(path.join(pluginDir, code));

        if (!instance.code) { instance.code = code; }
        if (!instance.name) { instance.name = codeToName(code); }
        if (!instance.status) { instance.status = 'I'; }
        if (!instance.teaser && cfg.get('plugins:teaser:enable')) {
            instance.teaser = downsize(instance.description || '', cfg.get('plugins:teaser'));
        }

        return instance;
    }

    function execute(plugins, operation, req, res) {
        return when
            .resolve(_.filter(plugins, function (plugin) {
                return _.isFunction(plugin[operation]);
            }))
            .then(function (plugins) {
                return plugins.map(function (plugin) {
                    return plugin[operation].bind(plugin);
                });
            })
            .then(function (tasks) {
                return parallel(tasks, req, res);
            });
    }

    module.exports = new PluginService();

}());