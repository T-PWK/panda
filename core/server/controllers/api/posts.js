var provider    = require('../../providers').postProvider,
    when        = require('when'),
    node        = require('when/node'),
    format      = require('util').format,
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

module.exports.create = function (req, res) {
    var post = _.extend({}, req.body),
        options = {};

    if (req.query.publish === 'true') options.publish = true;

    post._authorId = "_1";

    if (post.slug) {
//        provider.findBySlug(post.slug).then
    }

    // Check if there is no post with the given slug
    // If there is on, suffix slug with index number (slug_index)
    when
        .iterate(increase, 
            function (seed) {
                var slug = post.slug;
                if (seed > 0) slug = format('%s_%s', slug, seed);

                return provider
                    .findBySlug(slug)
                    .then(function (post) { return !post; });
            }, 
            noop, 0)
        .then(function (seed) {
            if (seed > 0) {
                post.slugOpt = false;
                post.slug = format('%s_%s', post.slug, seed);
            }
            return provider.create(post, options);
        })
        .then(function (id) {
            res.json({ id:id });
        });
};

module.exports.update = function (req, res) {
    var post = _.extend({}, req.body),
        options = {};

    if (req.query.publish === 'true') options.publish = true;

    provider
        .update(post, options)
        .then(res.json.bind(res, post));
};

module.exports.show = function (req, res) {
    if (req.post) res.json(req.post);
    else res.send(404);
};

module.exports.load = function (id, fn) {
    node.liftCallback(fn)(provider.findById(id));
};

function increase (value) {
    return value + 1;
}

function noop () { }