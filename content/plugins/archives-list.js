(function () {
    "use strict";

    var when     = require('when'),
        provider = require('../../core/server/providers').postsProvider;

    module.exports = {
        name: "Archive List Plugin",

        description: "Generates archives list from the live posts and assigns it to the <code>archive</code> template variable",

        author: {
            name: "Panda Team",
            url: "https://github.com/T-PWK/panda"
        },

        request: function (req, res) {
            return provider.archiveInfo().then(function (archive) {
                res.locals.archives = archive;
            });
        }
    };

    require('pkginfo')(module, 'version');

}());