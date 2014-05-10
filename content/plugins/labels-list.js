(function () {
    "use strict";

    var when     = require('when'),
        provider = require('../../core/server/providers').postsProvider;

    module.exports = {
        code: 'panda-labels-list',

        name: "Labels List Plugin",

        description: "Generates labels list from the live posts and assigns it to the <code>labels</code> template variable",

        author: {
            name: "Panda Team",
            url: "https://github.com/T-PWK/panda"
        },

        request: function (req, res) {
            return provider.labelsInfo({ live: true }).then(function (labels) {
                res.locals.labels = labels;
            });
        }
    };

    require('pkginfo')(module, 'version');

}());