(function () {
    'use strict';

    var provider    = require('../../providers').postProvider,
        when        = require('when'),
        node        = require('when/node'),
        format      = require('util').format,
        _           = require('underscore');

    module.exports.index = function (req, res) {
        var page = ('undefined' === typeof req.query.page) ? undefined : req.query.page.toLowerCase() === 'true';

        provider
            .findAll({
                page: page,
                limit: +req.query.limit,
                skip: +req.query.skip,
                sortBy: req.query.sortBy,
                type: req.query.type,
                select: 'id title commentsCount featured page labels updatedAt createdAt publishedAt author.bio'
            })
            .then(res.json.bind(res));
    };

    module.exports.create = function (req, res) {
        var post = _.extend({}, req.body),
            options = {};

        if (req.query.publish === 'true') options.publish = true;

        post.author = "531badf9a0e6552c820002ae";

        // Check if there is no post with the given slug
        // If there is on, suffix slug with index number (slug_index)
        return findAvailableSlug(post.slug)
            .then(function (check) {
                if (check.seed > 0) {
                    post.slugOpt = false;
                    post.slug = check.slug;
                }
                return post;
            })
            .then(function (properties) {
                return provider.create(properties, options);
            })
            .done(
                function (post) { res.json({id:post.id}); },
                function (err) { res.send(500); }
        );
    };

    function findAvailableSlug(slug) {
        var outputSlug = slug;

        return when.iterate(increase,
            function (seed) {
                if (seed > 0) {
                    outputSlug = format('%s_%s', slug, seed);
                }
                return provider.findBySlug(outputSlug).then(function (post) { return !post; });
            }, noop, 0)
            .then(function (seed) {
                return { slug: outputSlug, seed: seed };
            });
    }

    module.exports.update = function (req, res) {
        var options = {};

        if (req.query.publish === 'true') {
            options.publish = true;
        }

        provider
            .update(req.params.post, req.body, options)
            .then(res.json.bind(res, req.body));
    };

    module.exports.show = function (req, res) {
        return (req.post) ? res.json(req.post) : res.send(404);
    };

    module.exports.load = function (id, fn) {
        node.liftCallback(fn)(provider.findById(id));
    };

    module.exports.destroy = function (req, res) {
        when.resolve(provider.delete(req.params.post)).done(res.json.bind(res), res.send.bind(res, 500));
    };

    function increase (value) {
        return value + 1;
    }

    function noop () { }

}());