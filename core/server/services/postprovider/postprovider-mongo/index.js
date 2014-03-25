// PostProvider using MongoDB

// PostProvider
// init
// loadFiles - init

// create (properties)
// findAll (properties) v
// findBySlug (slug) v
// findById (id) v
// findByDate (properties) v
// findByLabel
// count (properties)
// archiveInfo
// labelsInfo
// postCountInfo

(function(){
    'use strict';

    var mongoose    = require('mongoose'),
        moment      = require('moment'),
        when        = require('when'),
        _           = require('underscore'),
        Post        = require('./post-model');

    var PostProvider = module.exports = function () {
        this.db = mongoose.connection;
    };

    PostProvider.prototype.init = function () {
        return when.resolve();
    };

    function addQueryOptions(query, options) {
        if (!options) {
            return query;
        }

        if (options.live || 'live' === options.type) {
            query = query.where('publishedAt').lte(new Date());
        }

        return query
            .sort(options.sortBy || '-publishedAt')
            .skip(options.skip)
            .limit(options.limit)
            .select(options.select || undefined);
    }

    function addBasicSelection(selection, options) {
        if (!options) {
            return selection;
        }

        if ('undefined' !== typeof options.page) {
            selection.page = !!options.page;
        }

        return selection;
    }

    PostProvider.prototype.findAll = function (options) {
        options = options || {};

        var selection = addBasicSelection({}, options),
            query = addQueryOptions(Post.find(selection), options);

        if ('draft' === options.type) {
            query = query.exists('publishedAt', false);
        }

        if ('scheduled' === options.type) {
            query = query.where('publishedAt').gt(new Date());
        }

        return query.populate('author').exec();
    };

    PostProvider.prototype.findBySlug = function (slug, options) {
        // Increase page view counter
        // Post.update({ slug: slug }, { $inc: { 'counter.view':1 } }, function () {});
        var selection = addBasicSelection({slug: slug}, options);

        return addQueryOptions(Post.findOne(selection), options)
            .populate('author')
            .exec();
    };

    PostProvider.prototype.findById = function (id, options) {
        options = options || {};

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
//            .select('author title teaser publishedAt labels slug')
            .populate('author')
            .exec();
    };

    PostProvider.prototype.findByLabel = function (options) {
        if (!options) {
            return when.reject();
        }

        var selection = addBasicSelection({labels: options.label}, options);

        return addQueryOptions(Post.find(selection), options).exec();
    };

    PostProvider.prototype.count = function (opts) {
        opts = opts || {};
        var start, end = new Date(), month, query, cond = { page: false };

        if (opts.label) {
            cond.labels = opts.label;
        }

        // post published between start and end of the day
        if (opts.day) {
            month = opts.month - 1;
            start = moment([opts.year, month, opts.day]).startOf('day').toDate();
            end = moment([opts.year, month, opts.day]).endOf('day').toDate();
        }
        // post published between start and end of the month
        else if (opts.month) {
            month = opts.month - 1;
            start = moment([opts.year, month]).startOf('month').toDate();
            end = moment([opts.year, month]).endOf('month').toDate();
        }
        // post published between start and end of the year
        else if (opts.year) {
            start = moment([opts.year]).startOf('year').toDate();
            end = moment([opts.year]).endOf('year').toDate();
        }

        query = Post
            .count(cond)
            .where('publishedAt');

        if (start) {
            query = query.gte(start);
        }
        if (end) {
            query = query.lte(new Date(Math.min(end.valueOf(), Date.now())));
        }

        return query.exec();
    };

    PostProvider.prototype.postCountInfo = function (options) {
        var match = {};

        if ('undefined' !== typeof options.page) {
            match.page = options.page;
        }

        return Post.mapReduce({
            query: match,
            map: function () {
                emit(this.publishedAt ? this.publishedAt > Date.now() ? 'scheduled' : 'live' : 'draft', 1);
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
                { $match: { publishedAt: { $lte: new Date() }, page: false } },
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

    PostProvider.prototype.labelsInfo = function (opts) {
        return when(
            Post.aggregate(
                { $match: { publishedAt: { $lte: new Date() } } },  // limit by publication date
                { $project: { labels: 1, _id: 0 } },                // operate on labels only
                { $unwind: "$labels" },                             // convert labels to independent objects
                { $group: { _id: "$labels", count: { $sum: 1 } } }, // aggregate labels and count number of occurences
                { $sort: { count: -1 } },                           // sort label object by count descending
                { $project: { count: 1, label: "$_id", _id: 0 } }   // make sure we have label and count properties
            ).exec()
        );
    };

})();

