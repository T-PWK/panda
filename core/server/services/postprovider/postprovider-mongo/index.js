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
    return when.resolve();
}

PostProvider.prototype.findAll = function () {
    return Post
            .find({ hidden: false })
            .where('scheduled').lte(new Date())
            .sort('-scheduled')
            .exec();
};

PostProvider.prototype.findBySlug = function (slug) {
    // Increase page view counter
    Post.update({ slug: slug }, { $inc: { 'counter.view':1 } }, function () {});

    return Post
            .findOne({ slug: slug })
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
            .where('scheduled')
                .gte(moment([year]).startOf('year').toDate())
                .lte(new Date(endDate))
            .sort('-scheduled')
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
            .where('scheduled')
                .gte(moment([year, month]).startOf('month').toDate())
                .lte(new Date(endDate))
            .sort('-scheduled')
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
            .where('scheduled')
                .gte(moment([year, month, day]).startOf('day').toDate())
                .lte(new Date(endDate))
            .sort('-scheduled')
            .exec()
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