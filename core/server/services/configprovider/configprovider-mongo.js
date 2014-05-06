(function () {
    'use strict';

    var when        = require('when'),
        lift        = require('when/node').lift,
        _           = require('underscore'),
        debug       = require('debug')('panda:configProvider'),
        Redirect    = require('./../../models/mongoose/redirect'),
        Config      = require('./../../models/mongoose/config');

    var ConfigProvider = module.exports = function () {};

    ConfigProvider.prototype.init = function () {
        debug('initialization');

        return when.resolve();
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