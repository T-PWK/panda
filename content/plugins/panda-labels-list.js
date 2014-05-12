(function () {
    "use strict";

    var when     = require('when'),
        provider = require('../../core/server/providers').postsProvider;

    module.exports = {
        code: 'panda-labels-list',

        name: "Labels List for Panda",

        description: "<p>This plugin generates a labels list of your Panda blog." +
            "The list is assigned to the <code>labels</code> template variable and can be used in your blog theme.</p>",

        author: {
            name: "Panda Team",
            url: "https://github.com/T-PWK/panda"
        },

        post: labelsInfo,

        posts: labelsInfo
    };

    function labelsInfo(req, res) {
        return provider.labelsInfo({ live: true }).then(function (labels) {
            res.locals.labels = labels;
        });
    }

    require('pkginfo')(module, 'version');

}());