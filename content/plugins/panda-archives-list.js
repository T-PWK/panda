(function () {
    "use strict";

    var when     = require('when'),
        provider = require('../../core/server/providers').postsProvider;

    module.exports = {
        code: 'panda-archives-list',

        name: "Archive List Plugin",

        description: "<p>Generates archives list from the live posts and assigns it to the <code>archive</code> template variable.</p>",

        author: {
            name: "Panda Team",
            url: "https://github.com/T-PWK/panda"
        },

        post: function (req, res) {
            return archiveInfo(req, res);
        },

        posts: function (req, res) {
            return archiveInfo(req, res);
        }
    };

    function archiveInfo (req, res) {
        return provider.archiveInfo().then(function (archive) {
            res.locals.archives = archive;
        });
    }

    require('pkginfo')(module, 'version');

}());