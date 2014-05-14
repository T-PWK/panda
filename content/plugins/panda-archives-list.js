(function () {
    "use strict";

    var when     = require('when'),
        provider = require('../../core/server/providers').postsProvider;

    module.exports = {
        code: 'panda-archives-list',

        name: "Archive List for Panda",

        description: "<p>The Archive List for Panda plugin generates an archives in a year-based list of your published posts.</p>" +
            "<p>The archives list is assigned to the <code>archive</code> template variable and it can be used in your blog theme.</p>",

        author: {
            name: "Panda Team",
            url: "https://github.com/T-PWK/panda"
        },

        post: archiveInfo,

        posts: archiveInfo
    };

    function archiveInfo (req, res) {
        return provider.archiveInfo().then(function (archive) {
            res.locals.archives = archive;
        });
    }

    require('pkginfo')(module, 'version');

}());