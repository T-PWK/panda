var when             = require('when'),
    provider         = require('../providers').postProvider;

module.exports.posts = require('./api/posts');
module.exports.themes = require('./api/themes');
module.exports.adminthemes = require('./api/adminthemes');
module.exports.labels = require('./api/labels');

module.exports.postCountInfo = function (req, res) {
    var page = ('undefined' === typeof req.query.page) ? undefined 
        : req.query.page.toLowerCase() === 'true';

    provider.postCountInfo({ page: page }).then(res.json.bind(res));
};

module.exports.pages = function (req, res) {
    provider
        .fetchAll({ post: false, limit: +req.query.limit, sortBy: req.query.sortBy })
        .then(res.json.bind(res));
};