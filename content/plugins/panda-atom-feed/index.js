(function () {
    "use strict";

    var cfg             = require('nconf'),
        when            = require('when'),
        _               = require('lodash'),
        providers       = require('../../../core/server/providers'),
        postsProvider   = providers.postsProvider,
        userProvider    = providers.usersProvider,
        atomPostPerPage = cfg.get('app:feeds:atom:postsPerPage');

    module.exports = {
        request: function (req, res) {
            if (req.url !== '/atom') {
                return;
            }

            return when.all([
                postsProvider.findAll({ live: true, limit: atomPostPerPage, sortBy: '-publishedAt' }),
                postsProvider.labelsInfo({ live: true }),
                userProvider.findLeadUser(),
                postsProvider.count({ live: true })
            ]).spread(function (posts, labels, leadAuthor, totalPosts) {
                res.locals.totalPosts = totalPosts;
                res.locals.leadAuthor   = leadAuthor;
                res.locals.labels = labels;
                res.locals.posts = posts;
                res.locals.updated = _.max(posts, 'updatedAt').updatedAt;
                res.locals.startIndex = 0;
                res.locals.postsPerPage = atomPostPerPage;

                res.type('rss').render(__dirname + '/atom');

                return true;
            }).otherwise(function (err) {
                res.send(500);
                throw err;
            });
        }
    };

    require('pkginfo')(module, 'code', 'name', 'description', 'configuration', 'version', 'author');

}());