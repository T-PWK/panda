(function () {
    'use strict';

    var lift        = require('when/node').lift,
        cfg         = require('nconf'),
        _           = require('underscore'),
        debug       = require('debug')('panda:configProvider'),
        Config      = require('./../../models/mongoose/config');

    var ConfigProvider = module.exports = function () {};

    ConfigProvider.prototype.init = function () {
        debug('initialization');

        // Performs configuration updates with database values
        return this.findAllConfigs()
            .then(function (configs) {
                configs.forEach(function (config) {
                    cfg.set(config.key, config.value);
                    cfg.notify('set:' + config.key);
                });
            });
    };

    ConfigProvider.prototype.findAllConfigs = function () {
        return Config.find().exec();
    };

    ConfigProvider.prototype.saveConfig = function (key, value) {
        return Config.findOne({ key: key })
            .exec()
            .then(function (item) {
                var save;
                if (item) {
                    item.value = value;
                    save = lift(item.save.bind(item));
                } else {
                    var config = new Config({ key:key, value:value });
                    save = lift(config.save.bind(config));
                }
                return save();
            });
    };

})();