(function () {
    'use strict';

    var cfg              = require('nconf'),
        when             = require('when'),
        moment           = require('moment'),
        provider         = require('../providers').postProvider,
        pagination       = require('../helpers/pagination'),
        paginationRegexp = new RegExp(cfg.get('app:paginationUrl').replace(':page', '\\d+')),
        yearRegExp       = /^1|2\d{3}$/,
        monthRegExp      = /^0|1\d$/,
        dayRegExp        = /^0|1|2|3\d$/,
        pageNumberRegExp = /^\d+$/;

    module.exports.middleware = function (req, res, next) {
        when.join(
                provider.labelsInfo({ live:true }),
                provider.archiveInfo()
            )
            .spread(function (labels, archives) {
                res.locals.labels = labels;
                res.locals.archives = archives;
            })
            .then(next);
    };

    module.exports.index = function(req, res) {
        var limit = cfg.get('app:postsPerPage'),
            page = req.params.page || 1,
            skip = limit * (page - 1);

        when.join(
                provider.findAll({ live:true, page:false, limit:limit, skip:skip, sortBy:'-publishedAt' }),
                provider.count({ page:false, live: true })
            )
            .spread(function (posts, count) {
                res.locals.posts = posts;
                res.locals.pagination = pagination(req, count);

                res.render('index');
            })
            .otherwise(function (err) {
                res.send(500, err.toString());
            });
    };

    module.exports.year = function (req, res) {
        var limit = cfg.get('app:postsPerPage'),
            page = req.params.page || 1,
            skip = limit * (page - 1), year = +req.params.year;

        when.join(
                provider.findByDate({
                    live: true, page: false, year: year, skip: skip, limit: limit, sortBy: '-publishedAt' }),
                provider.count({ year: year, page: false, live: true })
            )
            .then(function (results) {
                res.locals.posts = results[0];
                res.locals.year = year;
                res.locals.pagination = pagination(req, results[1]);

                res.render('index');
            });
    };

    module.exports.month = function (req, res) {
        var limit = cfg.get('app:postsPerPage'),
            page = req.params.page || 1,
            skip = limit * (page - 1),
            year = +req.params.year,
            month = +req.params.month;

        when.join(
                provider.findByDate({
                    live: true, page: false,
                    month: month, year: year,
                    skip: skip, limit: limit, sortBy: '-publishedAt' }),
                provider.count({ month: month, year: year, page: false, live: true })
            )
            .spread(function (posts, count) {
                res.locals.posts = posts;
                res.locals.year = year;
                res.locals.month = month;
                res.locals.date = moment([year, month - 1]);
                res.locals.pagination = pagination(req, count);

                res.render('index');
            });
    };

    module.exports.day = function (req, res) {
        var limit = cfg.get('app:postsPerPage'),
            page = req.params.page || 1,
            skip = limit * (page - 1),
            year = +req.params.year,
            month = +req.params.month,
            day = +req.params.day;

        when.join(
                provider.findByDate({
                    live: true, page: false,
                    day: day, month: month, year: year,
                    skip: skip, limit: limit,
                    sortBy: '-publishedAt'
                }),
                provider.count({ day: day, month: month, year: year, page: false, live: true })
            )
            .then(function (results) {
                res.locals.posts = results[0];
                res.locals.year = year;
                res.locals.month = month;
                res.locals.day = day;
                res.locals.date = moment([year, month - 1, day]);
                res.locals.pagination = pagination(req, results[1]);

                res.render('index');
            });
    };

    module.exports.post = function (req, res, next) {
        when.resolve(
                provider.findBySlug(req.params.slug, { live: true })
            )
            .then(function (post) {

                // if there is no post with the given slug, check if there is no other route
                // which could handle that request e.g. /:year
                if (!post) {
                    return next('route');
                }

                res.locals.post = post;
                res.render(post.page ? 'page' : 'post');
            })
            .otherwise(function () {
                res.send(500);
            });
    };

    module.exports.searchByLabel = function (req, res) {
        var limit = cfg.get('app:postsPerPage'),
            page = req.params.page || 1,
            skip = limit * (page - 1);

        when.join(
                provider.findByLabel({
                    live: true, page: false,
                    label: req.params.label,
                    skip: skip, limit: limit, sortBy: '-publishedAt' }),
                provider.count({ label: req.params.label, page: false, live: true })
            )
            .spread(function (posts, count) {
                res.locals.posts = posts;
                res.locals.pagination = pagination(req, count);
                res.locals.label = req.params.label;

                res.render('index');
            });
    };

    module.exports.pageParam = function (req, res, next, page) {
        if (!page.match(pageNumberRegExp)) {
            return next('route');
        }
        if (+page > 1) {
            next();
        }
        else {
            // Redirect to URL with no pagination if page 1 is used e.g. /page/1
            var path = req.path.replace(paginationRegexp, '');
            path = ('' === path) ? '/' : path;
            res.redirect(path);
        }
    };

    module.exports.formatParam = function (req, res, next, format) {
        if (['html', 'json'].indexOf(format) >= 0) {
            next();
        }
        else {
            next('route');
        }
    };

    module.exports.yearParam = function (req, res, next, year) {
        if (year.match(yearRegExp)) {
            next();
        }
        else {
            next('route');
        }
    };

    module.exports.monthParam = function (req, res, next, month) {
        if (month.match(monthRegExp) && moment([+req.params.year, +month - 1]).isValid()) {
            next();
        }
        else {
            next('route');
        }
    };

    module.exports.dayParam = function (req, res, next, day) {
        if (day.match(dayRegExp) && moment([+req.params.year, +req.params.month - 1, +req.params.day]).isValid()) {
            next();
        }
        else {
            next('route');
        }
    };

}());