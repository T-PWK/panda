// PostProvider using memory storage

var _           = require('underscore'),
    when        = require('when'),
    nodefn      = require('when/node/function'),
    cfg         = require('nconf'),
    fs          = require('fs'),
    path        = require('path'),
    moment      = require('moment'),
    isAbsolute  = require('../../utils').isAbsolute,
    dateProps   = ['publishedAt', 'createdAt', 'updatedAt'];

var PostProvider = module.exports = function () {
    this.dummyData = [];
};

PostProvider.prototype.init = function () {
    return this.loadFiles();
};

PostProvider.prototype.loadFiles = function () {
    var that        = this,
        postsPath   = cfg.get('database:postsFile'),
        usersPath   = cfg.get('database:usersFile'),
        postsFile   = isAbsolute(postsPath) ? postsPath : path.join(cfg.get('paths:data'), postsPath),
        usersFile   = isAbsolute(usersPath) ? usersPath : path.join(cfg.get('paths:data'), usersPath),
        loadPosts   = nodefn.call(fs.readFile, postsFile),
        loadUsers   = nodefn.call(fs.readFile, usersFile);

    return when
        .join(loadPosts, loadUsers)                 // load data files
        .then(function (values) {                   // parse each file to JSON
            return when.map(values, JSON.parse);
        })
        .spread(function (posts, users) {           // set internal properties
            that.dummyData = posts;
            that.users = users;
        })
        .then(convertDateProperties.bind(that))     // convert date properties
        .then(updateAuthorInfo.bind(that));         // update users (authors)
};

PostProvider.prototype.select = function(opts) {
    opts = opts || {};

    var now = new Date(),
        // JavaScript Date uses 0-based month index
        month = (opts.month || 1) - 1;

    return this.dummyData.filter(function (item) {
        return !item.page && 
            item.publishedAt <= now &&
            (opts.label ? item.labels.indexOf(opts.label) >= 0 : true) &&
            (opts.year ? item.publishedAt.getFullYear() === opts.year : true) &&
            (opts.month ? item.publishedAt.getMonth() === month : true) &&
            (opts.day ? item.publishedAt.getDate() === opts.day : true);
    });
};

PostProvider.prototype.count = function (opts) {
    return when(this.select(opts).length);
};

PostProvider.prototype.fetchAll = function (opts) {
    var items, now = Date.now();

    if ('undefined' === typeof opts.post) {
        items = this.dummyData;
    } else {
        items = this.dummyData.filter(function (item) {
            return opts.post ? (item.page !== true) : item.page;
        });
    }

    switch(opts.type) {
        case 'scheduled': 
            items = items.filter(function (item) { return item.publishedAt > now; });
            break;
        case 'draft':
            items = items.filter(function (item) { return !item.publishedAt; });
            break;
        case 'published':
            items = items.filter(function (item) { return item.publishedAt <= now; });
            break;
        default:
    }

    return this.sortAndSlice(items, opts);
};

PostProvider.prototype.countByPublishedAt = function (opts) {
    var items, now = Date.now(), 
        count = { all: 0, published: 0, draft: 0, scheduled: 0 };

    if ('undefined' === typeof opts.post) {
        items = this.dummyData;
    } else {
        items = this.dummyData.filter(function (item) {
            return opts.post ? (item.page !== true) : item.page;
        });
    }

    items.forEach(function (item) {
        if (!item.publishedAt) this.draft++;
        else if (item.publishedAt > now) this.scheduled++;
        else this.published++;
    }, count);

    count.all = count.published + count.scheduled + count.draft;

    return when.resolve(count);
}

PostProvider.prototype.findAll = function (opts) {
    return this.sortAndSlice(this.select(), opts);
};

PostProvider.prototype.findById = function (id) {
    return when.resolve(_.findWhere(this.dummyData, {_id: id}));
};

PostProvider.prototype.findBySlug = function (slug) {
    return when.resolve(_.find(this.dummyData, function (item) {
        item.slug === slug && item.publishedAt <= Date.now();
    }));
};

PostProvider.prototype.findByYear = function (opts) {
    return this.sortAndSlice(this.select(opts), opts);
};

PostProvider.prototype.findByMonth = function (opts) {
    return this.sortAndSlice(this.select(opts), opts);
};

PostProvider.prototype.findByDay = function (opts) {
    return this.sortAndSlice(this.select(opts), opts);
};

PostProvider.prototype.findByLabel = function (opts) {
    if (!opts.label) return when.resolve([]);

    return this.sortAndSlice(this.select(opts), opts);
};

PostProvider.prototype.getArchiveInfo = function (opts) {
    var posts = this.select(opts);

    var info = _.chain(posts)
        .map(function (post) {
            return moment(post.publishedAt).startOf('month').valueOf();
        })
        .groupBy()
        .map(function (values, date) {
            return {
                dateMillisec: +date,
                date: moment(+date),
                count: values.length
            };
        })
        .sortBy(function (item) {
            return -item.dateMillisec;
        })
        .value();

    return when.resolve(info);
};

PostProvider.prototype.getLabelsInfo = function (opts) {
    return _.chain(this.select(opts))
        .map(function (post) {
            return post.labels;
        })
        .flatten()
        .countBy()
        .map(function (count, label) {
            return {
                label: label,
                count: count
            };
        })
        .sortBy(function (label) {
            return -label.count;
        })
        .value();
};

PostProvider.prototype.sortAndSlice = function(items, opts) {
    opts = opts || {};

    var start = opts.skip || 0, 
        end = (opts.limit) ? start + opts.limit : undefined;

    return when(this.sort(items, opts).slice(start, end));
};

PostProvider.prototype.sort = function (posts, opts) {
    var reverse = false,
        sortBy = opts.sortBy || '-publishedAt',
        posts = posts.slice(0);

    if (sortBy[0] === '-') {
        reverse = true;
        sortBy = sortBy.slice(1);
    }

    posts = _.sortBy(posts, sortBy);

    if (reverse) {
        posts.reverse();
    }

    return posts;
};

function convertDateProperties () {
    this.dummyData.forEach(function (post) {
        dateProps.forEach(function (prop) {
            if (this[prop]) this[prop] = new Date(this[prop]);
        }, post);
    });
}

function updateAuthorInfo () {
    this.dummyData.forEach(function (post) {
        post.author = this.users[post._authorId];
    }, this);
}
