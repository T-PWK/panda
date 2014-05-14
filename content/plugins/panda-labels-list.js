(function () {
    "use strict";

    var when     = require('when'),
        provider = require('../../core/server/providers').postsProvider;

    module.exports = {
        code: 'panda-labels-list',

        name: "Labels List for Panda",

        description: "<p>The Labels List for Panda plugin generates a labels list of your published posts. " +
            "The list items contain label name and number of posts it is associated with.</p>" +
            "<p>The labels list is assigned to the <code>labels</code> template variable and can be used in your blog theme.</p>",

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