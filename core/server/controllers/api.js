var when             = require('when'),
    provider         = require('../providers').postProvider;

module.exports.posts = function (req, res) {
    provider
        .findAll({ limit: +req.query.limit, sortBy: req.query.sortBy })
        .then(function (posts) {
            res.json(posts);
        });
}