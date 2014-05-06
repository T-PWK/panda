(function () {
    "use strict";

    var plugins = require('../../providers').pluginService;

    module.exports.index = function (req, res) {
        res.json(plugins.info());
    };

    module.exports.update = function (req, res) {
        var action;
        switch (req.query.act) {
            case 'start':
                action = plugins.start.bind(plugins);
                break;
            case 'stop':
                action = plugins.start.bind(plugins);
                break;
        }

        if (action) {
            action
                .then(
                res.json.bind(res, {})
            );

        } else {
            res.send(400);
        }

    };

}());