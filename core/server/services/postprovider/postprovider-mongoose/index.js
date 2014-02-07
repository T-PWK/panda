// PostProvider using MongoDB

var mongoose    = require('mongoose'),
    moment      = require('moment'),
    when        = require('when'),
    Post        = require('../../models/post');

var PostProvider = module.exports = function () {
    this.db = mongoose.connection;
}

PostProvider.prototype.init = function () {
    var deferred = when.defer();

    this.db.once('open', function () {
        deferred.resolve();
    });

    this.db.once('error', function (err) {
        deferred.reject(err);
    });

    mongoose.connect(process.env.MONGOLAB_URI); //TODO: config

    return deferred.promise;
}

PostProvider.prototype.findAll = function () {
    return Post
            .find({ hidden: false })
            .where('scheduled').lte(new Date())
            .exec();
};

PostProvider.prototype.findBySlug = function (slug) {
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
            .exec()
}

PostProvider.prototype.findByMonth = function (year, month) {
    return Post
            .find({ year: year, month: month, hidden: false })
            .where('scheduled').lt(new Date())
            .exec()
}