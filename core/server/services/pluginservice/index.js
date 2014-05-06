(function () {
    "use strict";

    var when        = require('when'),
        node        = require('when/node'),
        path        = require('path'),
        fs          = require('fs'),
        cfg         = require('nconf'),
        _           = require('lodash'),
        pluginDir   = cfg.get('paths:plugins');

    function PluginService() {
        this.plugins = [];
    }

    PluginService.prototype.init = function () {
        var self = this;

        return node.call(fs.readdir, pluginDir)
            .then(function (plugins) {
                plugins.forEach(function (plugin) {
                    self.plugins.push(instantiatePlugin(plugin));
                });
                return self.plugins;
            })
            .then(function (plugins) {
                // Initialize all plugins with init method
                return when.all(
                    _.chain(plugins).filter('init').map(function (plugin) {
                        return plugin.init();
                    }).value());
            });

        function instantiatePlugin (plugin) {
            return require(path.join(pluginDir, plugin));
        };

    };

    module.exports = PluginService;

}());