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
        debug           = require('debug')('panda:pluginService'),
        pluginDir       = cfg.get('paths:plugins'),
        configProvider;

    function PluginService() {
        this.available  = []; // Available plugin ids
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
                self.available = ids;

                // Set all plugins as inactive and then enable the ones from the 'enabled' list
                _.forEach(ids, self.addInactive.bind(self));
            })
            .then(function () {
                // Returns list of available plugin ids ready to be started
                return _.intersection(self.available, cfg.get('plugins:enabled') || []);
            })
            .then(function (ids) {
                // Convert list of ids into a list of plugin startup promises
                return when.all(_.map(ids, function (id) {
                    return self.start(id);
                }));
            });
    };

    PluginService.prototype.addInactive = function (id) {
        this.inactive.push({id: id, name: idToName(id)});
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

        return when.resolve(id)
            .then(instantiatePlugin)
            .tap(function (instance) {
                if (_.isFunction(instance.start)) {
                    return instance.start();
                }
            })
            .tap(function (instance) {
                self.active.push(instance);
                _.remove(self.inactive, {id: instance.id});
            });
    };

    PluginService.prototype.info = function () {
        return {
            active: _.map(this.active, function (plugin) {
                return _.pick(plugin, 'id', 'name', 'description', 'version', 'author');
            }),
            inactive: this.inactive
        };
    };

    PluginService.prototype.request = function (req, res) {
        return execute(this.active, 'request',  req, res);
    };

    PluginService.prototype.header = function (req, res) {
        return execute(this.active, 'header', req, res)
            .then(function (headers) {
                res.locals.__header__ = headers.join('');
            });
    };

    PluginService.prototype.footer = function (req, res) {
        return execute(this.active, 'footer', req, res)
            .then(function (headers) {
                res.locals.__footer__ = headers.join('');
            });
    };

    function idToName(id) {
        return str.titleize(str.humanize(path.basename(id, '.js')))
    }

    function instantiatePlugin (id) {
        var instance = require(path.join(pluginDir, id)).plugin(id);

        instance.id = id;
        instance.name = idToName(id);

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
                })
            })
            .then(function (tasks) {
                return parallel(tasks, req, res);
            });
    }

    module.exports = PluginService;

}());