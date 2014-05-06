(function () {
    "use strict";

    var when        = require('when'),
        node        = require('when/node'),
        parallel    = require('when/parallel'),
        path        = require('path'),
        fs          = require('fs'),
        cfg         = require('nconf'),
        _           = require('lodash'),
        str         = require('underscore.string'),
        pluginDir   = cfg.get('paths:plugins');

    function PluginService() {
        this.plugins = [];
        this.disabled = [];
        this.enabled = cfg.get('plugins:enabled') || [];
    }

    PluginService.prototype.init = function () {
        var self = this, instance;

        return node.call(fs.readdir, pluginDir)
            .then(function (plugins) {

                // Remove non-plugin files
                return _.without(plugins, 'README');
            })
            .tap(function (plugins) {

                // Setup list of disabled plugins
                self.disabled = _.difference(plugins, self.enabled);
            })
            .then(function (plugins) {

                // Filter out all enabled plugins
                return _.intersection(self.enabled, plugins);
            })
            .then(function (plugins) {

                // Instantiate every enabled plugin
                plugins.forEach(function (id) {
                    self.plugins.push(instantiatePlugin(id));
                });

                return self.plugins;
            })
            .then(function (plugins) {

                // Initialize all the enabled plugins with 'start' method
                return when.all(
                    _.chain(plugins).filter('start').map(function (plugin) {
                        return plugin.start();
                    }).value());
            });

        function instantiatePlugin (plugin) {
            var instance = require(path.join(pluginDir, plugin));

            if (!instance.id) { instance.id = plugin; }
            if (!instance.name) { instance.name = idToName(plugin); }

            return instance;
        }
    };

    PluginService.prototype.stop = function (id) {
        var plugin = _.find(this.plugins, {id: id});

        if (!plugin) {
            return when.reject();
        }

    };

    PluginService.prototype.start = function (id) {
        var plugin = _.find(this.disabled, id), self = this;

        if (!plugin) {
            return when.reject();
        }

        return when.resolve(id)
            .then(function (id) {
                return instantiatePlugin(id);
            })
            .then(function (instance) {
                self.plugins.push = instance;
                self.disabled = _.without(self.disabled, id);

                if (instance.start) {
                    instance.start();
                }
            });
    };

    PluginService.prototype.info = function () {
        return {
            plugins: _.map(this.plugins, function (plugin) {
                return _.pick(plugin, 'id', 'name', 'description', 'version');
            }),
            disabled: _.map(this.disabled, function (plugin) {
                return {
                    id: plugin,
                    name: idToName(plugin)
                };
            })
        };
    };

    PluginService.prototype.request = function (req, res) {
        return execute(this.plugins, 'request',  req, res);
    };

    PluginService.prototype.header = function (req, res) {
        return execute(this.plugins, 'header',  req, res);
    };

    PluginService.prototype.footer = function (req, res) {
        return execute(this.plugins, 'footer', req, res);
    };

    function idToName(id) {
        return str.titleize(str.humanize(path.basename(id, '.js')))
    }

    function execute(plugins, operation, req, res) {
        return when
            .resolve(_.filter(plugins, operation))
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