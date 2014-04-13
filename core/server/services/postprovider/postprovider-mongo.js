// PostProvider using MongoDB

(function(){
    'use strict';

    var mongoose            = require('mongoose'),
        moment              = require('moment'),
        _                   = require('lodash'),
        when                = require('when'),
        lift                = require('when/node').lift,
        debug               = require('debug')('panda:postProvider'),
        Post                = require('./../../models/mongoose/post'),
        postAllowedProps    =
            ['slug', 'title', 'teaser', 'markdown', 'content', 'labels', 'publishedAt', 'author',
             'autoPublishOpt', 'autoSlugOpt', 'featured', 'page'];

    var PostProvider = function () {};

    PostProvider.prototype.init = function () {
        debug('initializing');
        return when.resolve();
    };

    function addQueryOptions(query, options) {
        if (!options) {
            return query;
        }

        if (options.live || 'live' === options.type) {
            query = query.where('publishedAt').lte(new Date());
        }

        if ('scheduled' === options.type) {
            query = query.where('publishedAt').gt(new Date());
        }

        return query
            .sort(options.sortBy)
            .skip(options.skip)
            .limit(options.limit)
            .populate('author')
            .select(options.select || undefined);
    }

    function addBasicSelection(selection, options) {
        if (!options) {
            return selection;
        }

        if ('undefined' !== typeof options.page) {
            selection.page = !!options.page;
        }

        if (options.live || 'live' === options.type) {
            selection.published = true;
        }

        if ('draft' === options.type) {
            selection.published = false;
        }

        if ('scheduled' === options.type) {
            selection.published = true;
        }

        return selection;
    }

    PostProvider.prototype.findAll = function (options) {
        debug('finding all posts %j', options);

        options = options || {};

        var selection = addBasicSelection({}, options),
            query = addQueryOptions(Post.find(selection), options);

        return query.exec();
    };

    PostProvider.prototype.findBySlug = function (slug, options) {
        // Increase page view counter
        // Post.update({ slug: slug }, { $inc: { 'counter.view':1 } }, function () {});
        var selection = addBasicSelection({slug: slug}, options);

        return addQueryOptions(Post.findOne(selection), options)
            .exec();
    };

    PostProvider.prototype.findById = function (id, options) {
        options = options || {};

        debug('finding post by id %j', id);

        return Post.findById(id).select(options.select || undefined).exec();
    };

    PostProvider.prototype.findByDate = function (options) {
        var selection = addBasicSelection({}, options), end, start, month = options.month - 1;

        if (options.day) {
            end = moment([options.year, month, options.day]).endOf('day').toDate();
            start = moment([options.year, month, options.day]).startOf('day').toDate();
        }
        else if (options.month) {
            end = moment([options.year, month]).endOf('month').toDate();
            start = moment([options.year, month]).startOf('month').toDate();
        }
        else if (options.year) {
            end = moment([options.year]).endOf('year').toDate();
            start = moment([options.year]).startOf('year').toDate();
        }

        if (options.live) {
            end = new Date(Math.min(Date.now(), end));
        }

        return addQueryOptions(Post.find(selection), options)
            .where('publishedAt').gte(start).lte(end)
            .populate('author')
            .exec();
    };

    PostProvider.prototype.findByLabel = function (options) {
        debug('finding post by label %j', options && options.label);

        if (!options) {
            return when.reject();
        }

        var selection = addBasicSelection({labels: options.label}, options);

        return addQueryOptions(Post.find(selection), options).exec();
    };

    PostProvider.prototype.count = function (options) {
        options = options || {};

        debug('fetching posts count %j', options);

        var selection = addBasicSelection({}, options), query, end, start, month = options.month - 1;

        if (options.label) {
            selection.labels = options.label;
        }

        if (options.day) {
            end = moment([options.year, month, options.day]).endOf('day').toDate();
            start = moment([options.year, month, options.day]).startOf('day').toDate();
        }
        else if (options.month) {
            end = moment([options.year, month]).endOf('month').toDate();
            start = moment([options.year, month]).startOf('month').toDate();
        }
        else if (options.year) {
            end = moment([options.year]).endOf('year').toDate();
            start = moment([options.year]).startOf('year').toDate();
        }

        if (options.live) {
            end = new Date(Math.min(_.now(), end || _.now()));
        }

        query = addQueryOptions(Post.count(selection), options);

        if (start || end) {
            query = query.where('publishedAt');

            if (start) {
                query = query.gte(start);
            }
            if (end) {
                query = query.lte(end);
            }
        }

        return query.exec();
    };

    PostProvider.prototype.postStatsInfo = function (options) {
        var match = {};

        if ('undefined' !== typeof options.page) {
            match.page = options.page;
        }

        return Post.mapReduce({
            query: match,
            map: function () {
                var type = this.published === false ? 'draft' :
                        this.publishedAt > Date.now() ? 'scheduled' : 'live';
                emit(type, 1);
            },
            reduce: function (key, values) {
                return values.length;
            }
        }).then(function (model) {
            return _.reduce(model, function (memo, item) {
                memo.all += item.value;
                memo[item._id] = item.value;
                return memo;
            }, { all: 0, live: 0, draft: 0, scheduled: 0 });
        });
    };

    PostProvider.prototype.archiveInfo = function (opts) {
        function processArchives (archives) {
            archives.forEach(function (archive) {
                archive.date = moment([archive._id.year, archive._id.month - 1]);
            });

            return archives;
        }

        return when(
            Post.aggregate(
                // exclude unpublished posts and pages
                { $match: { publishedAt: { $lte: new Date() }, published: true, page: false } },
                // group posts by year and month
                { $group: {
                    _id: { year: { $year: "$publishedAt" }, month: { $month: "$publishedAt" } },
                    count: { $sum: 1 }
                } },
                // recent dates go first
                { $sort: { "_id.year": -1, "_id.month": -1 } }
            ).exec()
        ).then(processArchives);
    };

    PostProvider.prototype.labelsInfo = function (options) {
        options = options || {};
        var match = {};

        if (options.live) {
            match.publishedAt = { $lte: new Date() };
            match.published = true;
        }

        return when(
            Post.aggregate(
                { $match: match },                                  // limit by publication date
                { $project: { labels: 1, _id: 0 } },                // operate on labels only
                { $unwind: "$labels" },                             // convert labels to independent objects
                { $group: { _id: "$labels", count: { $sum: 1 } } }, // aggregate labels and count number of occurences
                { $sort: { count: -1 } },                           // sort label object by count descending
                { $project: { count: 1, label: "$_id", _id: 0 } }   // make sure we have label and count properties
            ).exec()
        );
    };

    PostProvider.prototype.update = function (id, properties, options) {
        debug('updating post %j : %j', id, properties);

        if (!properties) return when.reject();

        var post = _.pick(properties, postAllowedProps);

        return Post.findById(id).exec()
            .then(function (item) {
                if (!item) return when.reject();

                _.extend(item, post, { updatedAt: new Date() });

                if (options.publish && !item.published) {
                    item.published = true;
                }

                if (options.draft) {
                    item.published = false;
                }
                return lift(item.save.bind(item))();
            })
            .then(function (result) {
                // result array contains updated post and number of affected posts
                return result[0];
            });
    };

    PostProvider.prototype.create = function (properties, options) {
        debug('creating post %j', properties);

        var post = _.pick(properties, postAllowedProps);

        if (options.publish) {
            post.published = true;
        }

        return Post.create(post);
    };

    PostProvider.prototype.delete = function (id) {
        debug('deleting post %j', id);

        return Post.findByIdAndRemove(id).exec();
    };

    module.exports = PostProvider;

})();

