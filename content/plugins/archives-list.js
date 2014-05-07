(function () {
    "use strict";

    var when = require('when'), provider;

    require('pkginfo')(module, 'version');

    module.exports.name = "Archive List Plugin";
    module.exports.description = "Generates archives list from the live posts and assigns it to the 'archive' template variable.";
    module.exports.author = "Panda";

    module.exports.start = function () {
        provider = require('../../core/server/providers').postProvider;
    };

    module.exports.request = function (req, res) {
        return provider.archiveInfo().then(function (archive) { res.locals.archives = archive; });
    };
}());