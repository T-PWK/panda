// PostProvider using memory storage

var when        = require('when'),
    nodefn      = require('when/node/function'),
    cfg         = require('nconf'),
    fs          = require('fs'),
    path        = require('path'),
    moment      = require('moment'),
    dateProps   = ['publishedAt', 'createdAt', 'updatedAt'];

var PostProvider = module.exports = function () {
    this.type = 'memory';
    this.dummyData = [];
    this.users;
};

PostProvider.prototype.init = function () {
    var that        = this,
        dataFile    = path.join(cfg.get('paths:data'), 'posts.json'),
        usersFile   = path.join(cfg.get('paths:data'), 'users.json'),
        loadData    = nodefn.call(fs.readFile, dataFile),
        loadUsers   = nodefn.call(fs.readFile, usersFile);

    return when
        .join(loadData, loadUsers)
        .then(function (data) {
            that.dummyData = JSON.parse(data[0]);
            that.users = JSON.parse(data[1])
        })
        .then(convertDateProperties.bind(that))
        .then(updateAuthorInfo.bind(that));
};

PostProvider.prototype.select = function(opts) {
    opts = opts || {};

    var now = new Date(),
        // JavaScript Date uses 0-based month index
        month = (opts.month || 1) - 1,
        items = this.dummyData.filter(function (item) {
            return !item.page
                && item.publishedAt <= now
                && (opts.year ? item.publishedAt.getFullYear() === opts.year : true)
                && (opts.month ? item.publishedAt.getMonth() === month : true)
                && (opts.day ? item.publishedAt.getDate() === opts.day : true)
        });

    return items;
}

PostProvider.prototype.count = function (opts) {
    return when(this.select(opts).length);
}

PostProvider.prototype.findAll = function (opts) {
    return this.sliceAndSort(this.select(), opts)
};

PostProvider.prototype.findBySlug = function (slug) {
    var items = this.dummyData.filter(function (item) {
        return item.slug === slug && item.publishedAt <= new Date();
    });

    return when(items[0]);
};

PostProvider.prototype.findByYear = function (opts) {
    return this.sliceAndSort(this.select(opts), opts)
};

PostProvider.prototype.findByMonth = function (opts) {
    return this.sliceAndSort(this.select(opts), opts)
};

PostProvider.prototype.findByDay = function (opts) {
    return this.sliceAndSort(this.select(opts), opts);
};

PostProvider.prototype.findByLabel = function (opts) {
    if (!opts.label) return when([]);

    var now = new Date(),
        items = this.dummyData.filter(function (item) {
            return !item.page
                && item.labels 
                && item.labels.indexOf(opts.label) >= 0
                && item.publishedAt <= now;
        })

    return this.sliceAndSort(posts, opts);
};

PostProvider.prototype.sliceAndSort = function(items, opts) {
    opts = opts || {};

    var start = opts.skip || 0, 
        end = (opts.limit) ? start + opts.limit : items.length - 1;

    return when(this.sort(items).slice(start, end));
}

PostProvider.prototype.sort = function (posts) {
    posts = posts.slice(0);
    posts.sort(this.sortByDate)

    return posts;
};

PostProvider.prototype.sortByDate = function (a, b) {
    if (a.publishedAt > b.publishedAt) return -1;
    if (a.publishedAt < b.publishedAt) return 1;
    return 0;
};

function convertDateProperties () {
    this.dummyData.forEach(function (post) {
        dateProps.forEach(function (prop) {
            if (this[prop]) this[prop] = new Date(this[prop])
        }, post);
    });
};

function updateAuthorInfo () {
    this.dummyData.forEach(function (post) {
        post.author = this.users[post._authorId];
    }, this)
};
