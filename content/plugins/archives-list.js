(function () {
    "use strict";

    var when     = require('when'),
        provider = require('../../core/server/providers').postProvider;

    module.exports = {
        name: "Archive List Plugin",
        description: "Generates archives list from the live posts and assigns it to the 'archive' template variable",
        author: {
            name: "Panda Team"
        },

        request: function (req, res) {
            return provider.archiveInfo().then(function (archive) {
                res.locals.archives = archive;
            });
        }
    };

    require('pkginfo')(module, 'version');

}());