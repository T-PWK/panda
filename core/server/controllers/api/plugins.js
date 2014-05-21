(function () {
    "use strict";

    var plugins = require('../../providers').pluginsService;

    module.exports.index = function (req, res) {
        res.json(plugins.info());
    };

    module.exports.stop = function (req, res) {
        plugins.stopAndPersist(req.params.id).done(res.send.bind(res, 200, ''), res.send.bind(res, 400));
    };

    module.exports.start = function (req, res) {
        plugins.startAndPersist(req.params.id).done(res.send.bind(res, 200, ''), res.send.bind(res, 400));
    };

    module.exports.setup = function (req, res) {
        plugins.setup(req.params.id, req.body).done(res.send.bind(res, 200, ''), res.send.bind(res, 400));
    };

}());