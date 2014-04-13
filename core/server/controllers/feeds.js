(function () {
    'use strict';

    var when            = require('when'),
        cfg             = require('nconf'),
        join            = require('path').join,
        provider        = require('../providers').postProvider,
        userProvider    = require('../providers').userProvider,
        atomPostPerPage = cfg.get('app:feeds:atom:postsPerPage'),
        rssPostPerPage  = cfg.get('app:feeds:rss:postsPerPage');

    function view(req, name) {
        return join(req.app.get('admin views'), name);
    }

    module.exports.middleware = function (req, res, next) {
        when.join(
            provider.labelsInfo({ live:true }),
            userProvider.findLeadUser(),
            provider.count({ live:true })
        )
        .spread(function (labels, leadAuthor, totalPosts) {
            res.locals.labels       = labels;
            res.locals.leadAuthor   = leadAuthor;
            res.locals.totalPosts   = totalPosts;
        })
        .then(next);
    };

    module.exports.rss = function (req, res) {
        when.join(
            provider.findAll({ live:true, limit:rssPostPerPage })
        )
        .spread(function (posts) {

            res.locals.posts        = posts;
            res.locals.updated      = maxUpdatedDate(posts);
            res.locals.startIndex   = 0;
            res.locals.postsPerPage = rssPostPerPage;

            res.type('rss').render(view(req, 'rss'));
        })
        .catch(function (err) {
            res.send(500);
        });
    };

    module.exports.atom = function (req, res) {
        when.join(
            provider.findAll({ live:true, limit:atomPostPerPage })
        )
        .spread(function (posts) {

            res.locals.posts        = posts;
            res.locals.updated      = maxUpdatedDate(posts);
            res.locals.startIndex   = 0;
            res.locals.postsPerPage = atomPostPerPage;

            res.type('atom').render(view(req, 'atom'));
        })
        .catch(function (err) {
            res.send(500);
        });
    };

    module.exports.sitemap = function(req, res) {
        when.resolve(provider.findAll({ live:true }))
            .then(function(posts){
                res.locals.posts = posts;
                res.type('xml').render(view(req, 'sitemap'));
            })
    };

    function maxUpdatedDate(posts) {
        var dates = posts.map(function (post) {
            return post.publishedAt;
        }), max = Math.max.apply(null, dates);

        return new Date(max);
    }

})();