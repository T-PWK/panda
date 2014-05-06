(function () {
    "use strict";

    var plugins = require('../../providers').pluginService;

    module.exports.index = function (req, res) {
        res.json(plugins.info());
    };

}());