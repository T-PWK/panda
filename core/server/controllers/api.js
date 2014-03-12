var when             = require('when'),
    provider         = require('../providers').postProvider;

module.exports.posts = function (req, res) {
    provider
        .fetchAll({ post: true, limit: +req.query.limit, sortBy: req.query.sortBy })
        .then(function (posts) {
            res.json(posts);
        });
}

module.exports.pages = function (req, res) {
    provider
        .fetchAll({ post: false, limit: +req.query.limit, sortBy: req.query.sortBy })
        .then(function (pages) {
            res.json(pages);
        });
}