(function () {
    "use strict";

    var provider = require('../../providers').postsProvider;

    module.exports.index = function (req, res) {
        provider.labelsInfo().then(res.json.bind(res));
    };

}());