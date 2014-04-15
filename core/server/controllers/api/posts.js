(function () {
    'use strict';

    var provider            = require('../../providers').postProvider,
        cfg                 = require('nconf'),
        when                = require('when'),
        node                = require('when/node'),
        downsize            = require('downsize'),
        str                 = require('underscore.string'),
        format              = require('util').format,
        _                   = require('underscore'),
        postAllowedProps    = ['slug', 'title', 'teaser', 'markdown', 'content', 'labels', 'publishedAt', 'author',
            'autoPublishOpt', 'autoSlugOpt', 'featured', 'page'];

    module.exports.index = function (req, res) {
        var page = ('undefined' === typeof req.query.page) ? undefined : req.query.page.toLowerCase() === 'true';

        provider
            .findAll({
                page: page,
                limit: +req.query.limit,
                skip: +req.query.skip,
                sortBy: req.query.sortBy,
                type: req.query.type,
                title: req.query.title,
                select: 'id title commentsCount featured page labels updatedAt createdAt publishedAt author published'
            })
            .then(res.json.bind(res));
    };

    module.exports.create = function (req, res) {
        var post = _.extend({}, req.body),
            options = {};

        if (req.query.publish === 'true') {
            options.publish = true;
        }

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
                return provider.create(filterProperties(properties), options);
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
        var options = {},
            id      = req.params.post,
            post    = _.pick(req.body, postAllowedProps);

        if (req.query.publish === 'true') {
            options.publish = true;
        }

        if (req.query.draft === 'true') {
            options.draft = true;
        }

        // Generate teaser if automated generation is enabled and content property is provided
        if (cfg.get('admin:teaser:enable') && 'undefined' !== typeof post.content) {

            // Post content is cleaned (stripped HTML tags and remove new lines and extra spaces
            post.teaser = downsize(str.clean(str.stripTags(post.content)), cfg.get('admin:teaser:options'));
        }

        provider.update(id, post, options).then(res.json.bind(res));
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

    function filterProperties(properties) {
        return _.pick(properties, postAllowedProps);
    }

    function increase (value) {
        return value + 1;
    }

    function noop () { }

}());