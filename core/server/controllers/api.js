var when             = require('when'),
    provider         = require('../providers').postProvider;

module.exports.posts = function (req, res) {
    provider
        .fetchAll({
            post: true, 
            limit: +req.query.limit, 
            sortBy: req.query.sortBy,
            type: req.query.type
        })
        .then(res.json.bind(res));
}

module.exports.postsCountByPublishedAt = function (req, res) {
    provider.countByPublishedAt({ post: true }).then(res.json.bind(res));
}

module.exports.pagesCountByPublishedAt = function (req, res) {
    provider.countByPublishedAt({ post: false }).then(res.json.bind(res));
}

module.exports.pages = function (req, res) {
    provider
        .fetchAll({ post: false, limit: +req.query.limit, sortBy: req.query.sortBy })
        .then(res.json.bind(res));
}