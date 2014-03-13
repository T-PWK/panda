var when             = require('when'),
    provider         = require('../providers').postProvider;

module.exports.posts = function (req, res) {
    var page = ('undefined' === typeof req.query.page) ? undefined : req.query.page.toLowerCase() === 'true';
    provider
        .findAll({
            page: page,
            limit: +req.query.limit, 
            sortBy: req.query.sortBy,
            type: req.query.type
        })
        .then(res.json.bind(res));
}

module.exports.postCountInfo = function (req, res) {
    var page = ('undefined' === typeof req.query.page) ? undefined : req.query.page.toLowerCase() === 'true';
    provider.postCountInfo({ page: page }).then(res.json.bind(res));
}

module.exports.pages = function (req, res) {
    provider
        .fetchAll({ post: false, limit: +req.query.limit, sortBy: req.query.sortBy })
        .then(res.json.bind(res));
}