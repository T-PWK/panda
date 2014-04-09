(function () {
    "use strict";

    var provider = require('../../providers').postProvider;

    module.exports.index = function (req, res) {
        provider.labelsInfo().then(res.json.bind(res));
    };

}());