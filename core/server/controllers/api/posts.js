var provider    = require('../../providers').postProvider,
    _           = require('underscore');

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

module.exports.new = function (req, res) {
    res.send('new post');
};

module.exports.create = function (req, res) {
    var post = _.extend({}, req.body);
    // if (post.scheduledAt) post.scheduledAt = new Date(post.scheduledAt); 
    post.scheduledAt = undefined;
    post._authorId = "_1";
    post.page = post.page || false;
    
    provider.create(post).then(function (id) {
        res.json({id:id});
    });
    
    // console.info("creating new post .... ", req.body);
    // res.json({id: '234234234242332'}); //TODO: return id of newly created post
};

module.exports.update = function (req, res) {
    console.info("updating exiting post .... ", req.params.post, req.body);
    res.json(req.body);
};


module.exports.show = function (req, res) {
    provider
        .findById(req.params.post)
        .then(res.json.bind(res));
};