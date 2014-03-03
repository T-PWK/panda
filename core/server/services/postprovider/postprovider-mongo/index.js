// PostProvider using MongoDB

var mongoose    = require('mongoose'),
    moment      = require('moment'),
    when        = require('when'),
    cfg         = require('nconf'),
    Post        = require('./post-model');

var PostProvider = module.exports = function () {
    this.db = mongoose.connection;
}

PostProvider.prototype.init = function () {
    // var deferred = when.defer();

    // Post.create({
    //     slug: 'javascript-slice-substr-substring',
    //     title: 'What do JavaScript slice(), substr() and substring() do?',
    //     content: '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>',
    //     teaser: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit'
    // }, function (argument) {
    //     deferred.resolve();
    // })

    // deferred.resolve();

    // return deferred.promise;
    return when.resolve();
}

PostProvider.prototype.findAll = function (opts) {
    opts = opts || {};

    return Post
            .find({ page: false })
            .where('publishedAt').lte(new Date())
            .sort('-publishedAt')
            .skip(opts.skip)
            .limit(opts.limit)
            .select('author title teaser publishedAt labels slug')
            .populate('author')
            .exec();
};

PostProvider.prototype.findBySlug = function (slug) {
    // Increase page view counter
    // Post.update({ slug: slug }, { $inc: { 'counter.view':1 } }, function () {});

    // TODO: do not show unpublished items
    return Post
            .findOne({ slug: slug })
            .where('publishedAt').lte(new Date())
            .select('title content author publishedAt')
            .populate('author')
            .exec()
};

PostProvider.prototype.findByYear = function (opts) {
    opts = opts || {};

    // Make sure we do not return post scheduled after current date and time 
    // if getting all post from the current year
    var endDate = Math.min(
        moment([opts.year]).endOf('year').toDate(),
        new Date()
    );

    return Post
            .find({ page: false })
            .where('publishedAt')
                .gte(moment([opts.year]).startOf('year').toDate())
                .lte(new Date(endDate))
            .sort('-publishedAt')
            .skip(opts.skip)
            .limit(opts.limit)
            .select('author title teaser publishedAt labels slug')
            .populate('author')
            .exec()
}

PostProvider.prototype.findByMonth = function (opts) {
    opts = opts || {};

    // Moment uses 0-based month values i.e. 0 for Jan etc.
    var month = (opts.month || 1) - 1;

    // Make sure we do not return post scheduled after current date and time 
    // if getting all post from the current year
    var endDate = Math.min(
        moment([opts.year, month]).endOf('month').toDate(),
        new Date()
    );

    return Post
            .find({ page: false })
            .where('publishedAt')
                .gte(moment([opts.year, month]).startOf('month').toDate())
                .lte(new Date(endDate))
            .sort('-publishedAt')
            .skip(opts.skip)
            .limit(opts.limit)
            .select('author title teaser publishedAt labels slug')
            .populate('author')
            .exec()
}

PostProvider.prototype.findByDay = function (opts) {
    opts = opts || {};

    // Moment uses 0-based month values i.e. 0 for Jan etc.
    var month = (opts.month || 1) - 1;

    // Make sure we do not return post scheduled after current date and time 
    // if getting all post from the current year
    var endDate = Math.min(
        moment([opts.year, month, opts.day]).endOf('day').toDate(),
        new Date()
    );

    return Post
            .find({ page: false })
            .where('publishedAt')
                .gte(moment([opts.year, month, opts.day]).startOf('day').toDate())
                .lte(new Date(endDate))
            .sort('-publishedAt')
            .skip(opts.skip)
            .limit(opts.limit)
            .select('author title teaser publishedAt labels slug')
            .populate('author')
            .exec()
}

PostProvider.prototype.findByLabel = function (opts) {
    opts = opts || {};

    if (!opts.label) return when.resolve();

    return Post
        .find({ labels: opts.label, page: false })
        .where('publishedAt')
            .lte(new Date())
        .skip(opts.skip)
        .limit(opts.limit)
        .exec();
}

PostProvider.prototype.count = function (opts) {
    opts = opts || {};
    var start, end = new Date(), month, query, cond = { page: false };

    if (opts.label) cond.labels = opts.label;

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
        query = query.lte(new Date(Math.min(end, new Date())));
    }

    return query.exec();
}

PostProvider.prototype.getArchiveInfo = function (opts) {
    return [];
}; 

PostProvider.prototype.getLabelsInfo = function (opts) {
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
}