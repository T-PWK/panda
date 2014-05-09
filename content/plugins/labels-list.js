(function () {
    "use strict";

    var when     = require('when'),
        provider = require('../../core/server/providers').postProvider;

    module.exports = {
        name: "Labels List Plugin",
        description: "Generates labels list from the live posts and assigns it to the 'labels' template variable",
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