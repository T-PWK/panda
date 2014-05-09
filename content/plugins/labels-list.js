(function () {
    "use strict";

    var when     = require('when'),
        provider = require('../../core/server/providers').postsProvider;

    module.exports = {
        name: "Labels List Plugin",
        description: "Generates labels list from the live posts and assigns it to the <code>labels</code> template variable",
        author: {
            name: "Panda Team"
        },

        request: function (req, res) {
            return provider.labelsInfo({ live: true }).then(function (labels) {
                res.locals.labels = labels;
            });
        }
    };

    require('pkginfo')(module, 'version');

}());