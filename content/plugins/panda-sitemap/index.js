(function () {
    "use strict";

    var provider = require('../../../core/server/providers').postsProvider;

    module.exports = {
        request: function (req, res) {
            if (req.url === '/sitemap.xml') {
                return provider
                    .findAll({live: true})
                    .then(function (posts) {
                        res.locals.posts = posts;
                        res.type('xml').render(__dirname + '/sitemap');
                    });
            }
        }
    };

    require('pkginfo')(module, 'code', 'name', 'description', 'version', 'author');

}());