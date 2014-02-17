// PostProvider using memory storage

var when        = require('when'),
    nodefn      = require('when/node/function'),
    cfg         = require('nconf'),
    fs          = require('fs'),
    path        = require('path'),
    moment      = require('moment'),
    dateProps   = ['scheduled', 'created', 'updated'];

var PostProvider = module.exports = function () {
    this.type = 'memory';
    this.dummyData = [];
};

PostProvider.prototype.init = function () {
    var that = this,
        file = path.join(__dirname, '../../../../content/data', 'posts.json'),
        loadData = nodefn.call(fs.readFile, file);

    return loadData
        .then(function (data) {
            return JSON.parse(data);
        })
        .then(function (data) {
            that.dummyData = data;
            return data
        })
        .then(convertDateProperties);
};

PostProvider.prototype.countAll = function () {
    return when(this.dummyData.length);
};

PostProvider.prototype.findAll = function (opts) {
    opts = opts || {};

    var now = new Date(), 
        items = this.dummyData.filter(function (item) {
            return !item.page && item.scheduled < now;
        }),
        start = opts.skip || 0, 
        end = (opts.limit) ? start + opts.limit : items.length - 1;

    return when(this.sort(items).slice(start, end));
};

PostProvider.prototype.findBySlug = function (slug) {
    var items = this.dummyData.filter(function (item) {
        return item.slug === slug && item.scheduled <= new Date();
    });

    return when(items[0]);
};

PostProvider.prototype.findByYear = function (year) {
    var now = new Date(),
        items = this.dummyData.filter(function (item) {
            return !item.page
                && item.scheduled.getFullYear() === year 
                && item.scheduled <= now;
        });

    return when(this.sort(items));
};

PostProvider.prototype.findByMonth = function (year, month) {
    // JavaScript Date uses 0-based month index
    month--;

    var now = new Date(),
        items = this.dummyData.filter(function (item) {
            return !item.page
                && item.scheduled.getFullYear() === year 
                && item.scheduled.getMonth() === month
                && item.scheduled <= now;
        });
    
    return when(this.sort(items));
};

PostProvider.prototype.findByDay = function (year, month, day) {
    // JavaScript Date uses 0-based month index
    month--;

    var now = new Date(),
        items = this.dummyData.filter(function (item) {
            return !item.page
                && item.scheduled.getFullYear() === year 
                && item.scheduled.getMonth() === month
                && item.scheduled.getDate() === day
                && item.scheduled <= now;
        });

    return when(this.sort(items));
};

PostProvider.prototype.findByLabel = function (label) {
    if (!label) return when([]);

    var now = new Date(),
        items = this.dummyData.filter(function (item) {
            return !item.page
                && item.labels 
                && item.labels.indexOf(label) >= 0
                && item.scheduled
                && item.scheduled <= now;
        })

    return when(this.sort(items));
};

PostProvider.prototype.sort = function (posts) {
    posts = posts.slice(0);
    posts.sort(this.sortByDate)

    return posts;
};

PostProvider.prototype.sortByDate = function (a, b) {
    if (a.scheduled > b.scheduled) return -1;
    if (a.scheduled < b.scheduled) return 1;
    return 0;
};

function convertDateProperties (values) {
    values.forEach(function (item) {
        dateProps.forEach(function (prop) {
            if (this[prop]) this[prop] = new Date(this[prop])
        }, item);
    });
};