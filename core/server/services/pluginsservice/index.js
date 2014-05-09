(function () {
    "use strict";

    var when            = require('when'),
        node            = require('when/node'),
        parallel        = require('when/parallel'),
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
            .then(function (ids) {
                // Remove non-plugin files
                return _.without(ids, 'README');
            })
            .tap(function (ids) {
                // Set all plugins as inactive and then enable the ones from the 'enabled' list
                _.forEach(ids, self.addInactive.bind(self));
            })
            .then(function (ids) {
                // Returns list of available plugin ids ready to be started
                return _.intersection(ids, cfg.get('plugins:enabled') || []);
            })
            .then(function (ids) {
                // Convert list of ids into a list of plugin startup promises
                return when.all(_.map(ids, function (id) {
                    return self.start(id);
                }));
            });
    };

    PluginService.prototype.addInactive = function (id) {
        this.inactive.push(instantiatePlugin(id));
    };

    PluginService.prototype.stopAndPersist = function (id) {
        return this.stop(id)
            .tap(function () {
                return configProvider.saveConfig(
                    'plugins:enabled',
                    _.chain(cfg.get('plugins:enabled') || []).without(id).uniq().sort().value()
                );
            });
    };

    PluginService.prototype.startAndPersist = function (id) {
        return this.start(id)
            .tap(function () {
                return configProvider.saveConfig(
                    'plugins:enabled',
                    _.chain(cfg.get('plugins:enabled') || []).push(id).uniq().sort().value()
                );
            });
    };

    PluginService.prototype.stop = function (id) {
        debug('stopping plugin %j', id);

        var self    = this,
            plugin  = _.find(this.active, {id: id});

        if (!plugin) {
            return when.reject({id: id, msg: 'No active plugin'});
        }

        return when.resolve(plugin)
            .tap(function (plugin) {
                if (_.isFunction(plugin.stop)) {
                    return plugin.stop();
                }
            })
            .tap(function (plugin) {
                _.remove(self.active, {id: plugin.id});
                self.addInactive(plugin.id);
            });
    };

    PluginService.prototype.start = function (id) {
        debug('starting plugin %j', id);

        var self    = this,
            plugin  = _.find(this.inactive, {id: id});

        if (!plugin) {
            return when.reject({id: id, msg: 'No inactive'});
        }

        return when.resolve(plugin)
            .tap(function (plugin) {
                if (_.isFunction(plugin.start)) {
                    return plugin.start();
                }
            })
            .tap(function (plugin) {
                self.active.push(plugin);
                _.remove(self.inactive, {id: plugin.id});
            });
    };

    PluginService.prototype.info = function () {
        return {
            active: _.map(this.active, properties),
            inactive: _.map(this.inactive, properties)
        };

        function properties(plugin) {
            return _.pick(plugin, 'id', 'name', 'description', 'version', 'author', 'teaser');
        }
    };

    PluginService.prototype.request = function (req, res) {
        return execute(this.active, 'request',  req, res);
    };

    PluginService.prototype.pageHooks = function (name, req, res) {
        var hookName = name + 'Hook';
        return _.chain(this.active)
            .filter(function (plugin) {
                return _.isFunction(plugin[hookName]);
            })
            .invoke(hookName, req, res)
            .value();
    };

    function idToName(id) {
        return str.titleize(str.humanize(path.basename(id, '.js')));
    }

    function instantiatePlugin (id) {
        var instance = require(path.join(pluginDir, id));

        if (!instance.id) { instance.id = id; }
        if (!instance.name) { instance.name = idToName(id); }
        if (!instance.teaser) {
            var cleanDescription = str.clean(str.stripTags(instance.description || ''));
            instance.teaser = cleanDescription.substr(0, 50);
            instance.teaser += cleanDescription.length > 50 ? '...' : '';
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