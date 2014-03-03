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
<<<<<<< HEAD
    var deferred = when.defer();

    // Post.create({
    //     slug: 'javascript-slice-substr-substring',
    //     title: 'What do JavaScript slice(), substr() and substring() do?',
    //     content: '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>',
    //     teaser: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit'
    // }, function (argument) {
    //     deferred.resolve();
    // })

    deferred.resolve();

    return deferred.promise;
=======
    return when.resolve();
>>>>>>> 17958114594000e757f9374f06e960beaa186a41
}

PostProvider.prototype.findAll = function () {
    return Post
            .find({ published: true })
            .where('publishedAt').lte(new Date())
            .sort('-publishedAt')
            .exec();
};

PostProvider.prototype.findBySlug = function (slug) {
    // Increase page view counter
    // Post.update({ slug: slug }, { $inc: { 'counter.view':1 } }, function () {});

    // TODO: do not show unpublished items
    return Post
            .findOne({ slug: slug, published: true })
            .exec()
};

PostProvider.prototype.findByYear = function (year) {
    // Make sure we do not return post scheduled after current date and time 
    // if getting all post from the current year
    var endDate = Math.min(
        moment([year]).endOf('year').toDate(),
        new Date()
    );

    return Post
            .find({ hidden: false })
            .where('publishedAt')
                .gte(moment([year]).startOf('year').toDate())
                .lte(new Date(endDate))
            .sort('-publishedAt')
            .exec()
}

PostProvider.prototype.findByMonth = function (year, month) {

    // Moment uses 0-based month values i.e. 0 for Jan etc.
    month--;

    // Make sure we do not return post scheduled after current date and time 
    // if getting all post from the current year
    var endDate = Math.min(
        moment([year, month]).endOf('month').toDate(),
        new Date()
    );

    return Post
            .find({ hidden: false })
            .where('publishedAt')
                .gte(moment([year, month]).startOf('month').toDate())
                .lte(new Date(endDate))
            .sort('-publishedAt')
            .exec()
}

PostProvider.prototype.findByDay = function (year, month, day) {

    // Moment uses 0-based month values i.e. 0 for Jan etc.
    month--;

    // Make sure we do not return post scheduled after current date and time 
    // if getting all post from the current year
    var endDate = Math.min(
        moment([year, month, day]).endOf('day').toDate(),
        new Date()
    );

    return Post
            .find({ hidden: false })
            .where('publishedAt')
                .gte(moment([year, month, day]).startOf('day').toDate())
                .lte(new Date(endDate))
            .sort('-publishedAt')
            .exec()
}

PostProvider.prototype.count = function (opts) {
    console.info('count : ', opts)
    return Post.count();
}

PostProvider.prototype.getArchiveInfo = function (opts) {
    return [];
}; 

PostProvider.prototype.getLabelsInfo = function (opts) {
    return when(
         Post.aggregate(
            { $project: { labels: 1, _id:0 } },                 // operate on labels only
            { $unwind: "$labels" },                             // convert labels to independent objects
            { $group: { _id: "$labels", count: { $sum: 1 } } }, // aggregate labels and count number of occurences
            { $sort: { count: -1 } },                           // sort label object by count descending
            { $project: { count: 1, labal:"$_id", _id:0 } }     // make sure we have label and count properties
        ).exec()
    );
}