(function () {
    "use strict";

    var cfg             = require('nconf'),
        when            = require('when'),
        _               = require('lodash'),
        providers       = require('../../../core/server/providers'),
        postsProvider   = providers.postsProvider,
        userProvider    = providers.usersProvider,
        rssPostPerPage  = cfg.get('app:feeds:rss:postsPerPage');

    module.exports = {
        request: function (req, res) {
            if (req.url !== '/rss.xml') {
                return;
            }

            return when.all([
                postsProvider.labelsInfo({ live: true }),
                postsProvider.count({ live: true }),
                postsProvider.findAll({ live: true, limit: rssPostPerPage, sortBy: '-publishedAt' }),
                userProvider.findLeadUser()
            ]).spread(
                function (labels, totalPosts, posts, leadAuthor) {
                    res.locals.labels = labels;
                    res.locals.leadAuthor = leadAuthor;
                    res.locals.totalPosts = totalPosts;
                    res.locals.posts = posts;
                    res.locals.updated = _.max(posts, 'updatedAt').updatedAt;
                    res.locals.startIndex = 0;
                    res.locals.postsPerPage = rssPostPerPage;

                    res.type('rss').render(__dirname + '/rss');
                    return true;
                }
            ).otherwise(
                function (err) {
                    res.send(500);
                    throw err;
                }
            );
        }
    };

    require('pkginfo')(module, 'code', 'name', 'description', 'configuration', 'version', 'author');

}());