var provider = require('../../providers').postProvider;

module.exports.index = function (req, res) {
    var page = ('undefined' === typeof req.query.page) ? undefined 
        : req.query.page.toLowerCase() === 'true';

    provider
        .findAll({
            page: page,
            limit: +req.query.limit, 
            skip: +req.query.skip,
            sortBy: req.query.sortBy,
            type: req.query.type
        })
        .then(res.json.bind(res));
};

module.exports['new'] = function (req, res) {
    res.send('new post');
};

module.exports.create = function (req, res) {
    // console.info(req.body)
    res.send('create post');
};

module.exports.show = function (req, res) {
    provider
        .findById(req.params.post)
        .then(res.json.bind(res));
};