// PostProvider using memory storage
(function () {
    'use strict';

    var _           = require('underscore'),
        when        = require('when'),
        nodefn      = require('when/node/function'),
        cfg         = require('nconf'),
        fs          = require('fs'),
        path        = require('path'),
        moment      = require('moment'),
        idGen       = require('../idgenerator'),
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

                convertDateProperties(posts);
                updateAuthorInfo(posts, users);
            });
    };

    PostProvider.prototype.create = function(post) {
        post.id = idGen();

        this.dummyData.push(post);

        return when.resolve(post.id);
    };

    /*
     * Find all posts
     */
    PostProvider.prototype.findAll = function (opts) {
        return sortAndSlice(select(this.dummyData, opts), opts);
    };

    /*
     * Finds a single post by slug
     */
    PostProvider.prototype.findBySlug = function (slug, opts) {
        var chain = _.chain(this.dummyData).filter(function (post) {
            return post.slug === slug;
        });

        return when.resolve(updateSelection(chain, opts).first().value());
    };

    /*
     * Finds a single post by id
     */
    PostProvider.prototype.findById = function (id, opts) {
        var chain = _.chain(this.dummyData).filter(function (post) {
            return post.id === id;
        });

        return when.resolve(updateSelection(chain, opts).first().value());
    };

    /*
     * Finds posts at a given date range (from start to end of a year, or a month, or a day)
     */
    PostProvider.prototype.findByDate = function (opts) {
        return sortAndSlice(select(this.dummyData, opts), opts);
    };

    PostProvider.prototype.findByLabel = function (opts) {
        if (!opts.label) return when.resolve([]);

        return sortAndSlice(select(this.dummyData, opts), opts);
    };

    PostProvider.prototype.count = function (opts) {
        return when.resolve(select(this.dummyData, opts).length);
    };

    function updateSelection (chain, opts) {
        if (!opts) return chain;

        var now = Date.now();

        if (opts.live || 'live' === opts.type) {
            chain = chain.filter(function (post) {
                return post.publishedAt <= now;
            });
        }

        if('undefined' !== typeof opts.page) {
            chain = chain.filter(function (post) {
                return post.page === opts.page;
            });
        }

        return chain;
    }

    function select(posts, opts) {
        opts = opts || {};

        var month = (opts.month || 1) - 1, // JavaScript Date uses 0-based month index
            now = new Date(),
            chain = _.chain(posts);

        chain = updateSelection(chain, opts);

        if (opts.label) {
            chain = chain.filter(function (post) {
                return post.labels && post.labels.indexOf(opts.label) >= 0;
            });
        }

        if (opts.year) {
            chain = chain.filter(function (post) {
                return post.publishedAt && post.publishedAt.getFullYear() === opts.year;
            });
        }

        if (opts.month) {
            chain = chain.filter(function (post) {
                return post.publishedAt && post.publishedAt.getMonth() === month;
            });
        }

        if (opts.day) {
            chain = chain.filter(function (post) {
                return post.publishedAt && post.publishedAt.getDate() === opts.day;
            });
        }

        if ('draft' === opts.type) {
            chain = chain.filter(function (post) {
                return !post.publishedAt;
            });
        }

        if ('scheduled' === opts.type) {
            chain = chain.filter(function (post) {
                return post.publishedAt > now;
            });
        }

        return chain.value();
    }

    PostProvider.prototype.postCountInfo = function (opts) {
        var now = Date.now(),
            chain = updateSelection(_.chain(this.dummyData), opts),
            count = chain.reduce(function (count, post) {
                if (!post.publishedAt) count.draft++;
                else if (post.publishedAt > now) count.scheduled++;
                else count.live++;

                return count;
            }, { all: 0, live: 0, draft: 0, scheduled: 0 }).value();

        count.all = count.live + count.scheduled + count.draft;

        return when.resolve(count);
    };

    PostProvider.prototype.archiveInfo = function (opts) {
        var posts = select(this.dummyData, opts);

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

    PostProvider.prototype.labelsInfo = function (opts) {
        var labels = _.chain(select(this.dummyData, opts))
            .map(function (post) {
                return post.labels;
            })
            .flatten()
            .countBy()
            .map(function (count, label) {
                return { label: label, count: count };
            })
            .sortBy(function (item) {
                return -item.count;
            })
            .value();

        return when.resolve(labels);
    };

    function sortAndSlice(posts, opts) {
        opts = opts || {};

        var start = opts.skip || 0,
            end = (opts.limit) ? start + opts.limit : undefined;

        return when.resolve(sort(posts, opts).slice(start, end));
    }

    function sort(posts, opts) {
        var reverse = false,
            sortBy = opts.sortBy || '-publishedAt';

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
    }

    function convertDateProperties (data) {
        data.forEach(function (post) {
            dateProps.forEach(function (prop) {
                if (this[prop]) this[prop] = new Date(this[prop]);
            }, post);
        });
    }

    function updateAuthorInfo (data, users) {
        data.forEach(function (post) {
            post.author = users[post._authorId];
        });
    }

}());


