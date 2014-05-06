(function () {
    "use strict";

    var plugins = require('../../providers').pluginService;

    module.exports.index = function (req, res) {
        res.json(plugins.info());
    };

    module.exports.update = function (req, res) {
        setTimeout(function () {
            res.json(plugins.info());
        }, 2000)

    };

}());