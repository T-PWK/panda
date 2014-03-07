var when          = require('when'),
    join          = require('path').join,
    provider      = require('../providers').postProvider;

function view (req, name) {
    return join(req.app.get('admin views'), name);
}

module.exports.rss = function (req, res) {
    when(provider.findAll())
        .then(function (posts) {
            res.locals({ posts: posts });
            res.type('rss').render(view(req, 'rss'));
        })
        .catch(function (err) {
            res.send(500);
        });
};

module.exports.atom = function (req, res) {
    when(provider.findAll())
        .then(function (posts) {

            res.locals.posts = posts;
            res.locals.updated = maxUpdatedDate(posts);

            res
                .type('atom')
                .render(view(req, 'atom'));
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