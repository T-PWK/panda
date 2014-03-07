var when                = require('when'),
    cfg                 = require('nconf'),
    join                = require('path').join,
    provider            = require('../providers').postProvider,
    userProvider        = require('../providers').userProvider,
    atomPostPerPage     = cfg.get('app:feeds:atom:postsPerPage');

require('pkginfo')(module, 'version');

function view (req, name) {
    return join(req.app.get('admin views'), name);
}

module.exports.rss = function (req, res) {
    when.join(
        provider.findAll(), userProvider.findLeadUser()
    )
    .spread(function (posts, leadAuthor) {

        res.locals.posts        = posts;
        res.locals.leadAuthor   = leadAuthor;
        res.locals.version      = module.exports.version;

        res.type('rss').render(view(req, 'rss'));
    })
    .catch(function (err) {
        res.send(500);
    });
};

module.exports.atom = function (req, res) {
    when.join(
        provider.findAll({ limit: atomPostPerPage }),
        provider.count({ limit: atomPostPerPage }),
        provider.getLabelsInfo(),
        userProvider.findLeadUser()
    )
    .spread(function (posts, count, labels, leadAuthor) {

        res.locals.posts        = posts;
        res.locals.updated      = maxUpdatedDate(posts);
        res.locals.version      = module.exports.version;
        res.locals.labels       = labels;
        res.locals.leadAuthor   = leadAuthor;
        res.locals.totalPosts   = count;
        res.locals.startIndex   = 0;
        res.locals.postsPerPage = atomPostPerPage;

        res.type('atom').render(view(req, 'atom'));
    })
    .catch(function (err) {
        res.send(500);
    });
};

function maxUpdatedDate (posts) {
    var dates = posts.map(function (post) {
        return post.publishedAt;
    }), max = Math.max.apply(null, dates);

    return new Date(max);
}