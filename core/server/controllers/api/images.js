(function () {
    "use strict";

    var provider = require('../../providers').imageProvider;

    module.exports.index = function (req, res) {
        provider.all().done(res.json.bind(res), res.send.bind(res, 400));
    };

    module.exports.remove = function (req, res) {
        provider
            .remove(req.params.id)
            .done(
                function () { res.json({deleted: true}); },
                res.send.bind(res, 400));
    };

}());