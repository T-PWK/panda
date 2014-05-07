(function () {
    "use strict";

    var when        = require('when'),
        provider    = require('../../core/server/providers').postProvider;

    require('pkginfo')(module, 'version');

    function Plugin() {
        this.description = "Generates archives list from the live posts and assigns it to the 'archive' template variable";
        this.author = "Panda";
        this.version = module.exports.version;
    }

    Plugin.prototype.request = function (req, res) {
        return provider.archiveInfo().then(function (archive) { res.locals.archives = archive; });
    };

    module.exports.plugin = function () {
        return new Plugin();
    };
}());