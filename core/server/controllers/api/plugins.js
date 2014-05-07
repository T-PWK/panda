(function () {
    "use strict";

    var plugins = require('../../providers').pluginService;

    module.exports.index = function (req, res) {
        res.json(plugins.info());
    };

    module.exports.update = function (req, res) {
        var action,
            operation = (req.query.op || '').toLowerCase();

        switch (operation) {
            case 'start':
                action = plugins.startAndPersist.bind(plugins);
                break;
            case 'stop':
                action = plugins.stopAndPersist.bind(plugins);
                break;
        }

        if (action) {
            action(req.params.id).done(
                res.send.bind(res, 200, ''),
                res.send.bind(res, 400)
            );
        } else {
            res.send(400);
        }
    };

}());