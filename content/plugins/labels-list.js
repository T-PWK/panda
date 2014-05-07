(function () {
    "use strict";

    var when = require('when'), provider;

    require('pkginfo')(module, 'version');

    module.exports.name = "Labels List Plugin";
    module.exports.description = "Generates labels list from the live posts and assigns it to the 'labels' template variable.";
    module.exports.author = "Panda";

    module.exports.start = function () {
        provider = require('../../core/server/providers').postProvider;
    };

    module.exports.request = function (req, res) {
        return provider.labelsInfo({ live:true }).then(function (labels) { res.locals.labels = labels; });
    };

}());