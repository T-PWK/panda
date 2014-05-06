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
                    instance = instantiatePlugin(id);

                    if (!instance.id) { instance.id = id; }
                    if (!instance.name) { instance.name = str.humanize(id); }
                    if (!instance.version) { instance.version = '0.0.0' }

                    self.plugins.push(instance);
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
            return require(path.join(pluginDir, plugin));
        }
    };

    PluginService.prototype.info = function () {
        return {
            plugins: _.map(this.plugins, function (plugin) {
                return _.pick(plugin, 'id', 'name', 'description', 'version');
            }),
            disabled: this.disabled
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