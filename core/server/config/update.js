(function () {
    "use strict";

    var when        = require('when'),
        cfg         = require('nconf'),
        provider    = require('./../providers').configProvider;

    module.exports.init = function () {
        return provider.findAllConfigs().then(function (configs) {
            configs.forEach(function (config) {
                cfg.set(config.key, config.value);
                cfg.notify('set:'+config.key);
            })
        });
    };

}());