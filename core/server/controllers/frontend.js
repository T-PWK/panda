var cfg           = require('nconf'),
    when          = require('when'),
    provider      = require('../providers').postProvider,
    pagination    = require('../helpers/pagination'),
    Application   = require('../models/application'),
    limit         = cfg.get('app:postsPerPage')
    
var application = new Application({
    metaTitle:      cfg.get('app:defaultMetaTitle'),
    metaDesc:       cfg.get('app:defaultMetaDesc'),
    metaKeywords:   cfg.get('app:defaultKeywords'),
    title:          cfg.get('app:title'),
    description:    cfg.get('app:description'),
    url:            cfg.get('url'),
    cover:          '/assets/img/Baby-Panda-Wallpaper.jpg'
});

exports.index = function(req, res) {
    var page = req.params.page || 1, skip = limit * (page - 1);

    when.join(
        provider.findAll({ limit:limit, skip:skip }),
        provider.countAll()
    )
    .then(function (results) {
        res.render('index', {
            app: application,
            posts: results[0],
            pagination: pagination(req, results[1])
        })
    })
    .catch(function (err) {
        res.send(500, err);
    })
};

exports.year = function (req, res) {
    var year = +req.params.year;
    provider.findByYear(year).then(function (posts) {
        res.render('index', { 
            app: application,
            posts: posts, 
            year: year
        });
    });
};

exports.month = function (req, res) {
    var year  = +req.params.year,
        month = +req.params.month;

    provider.findByMonth(year, month).then(function (posts) {
        res.render('index', { 
            app: application,
            posts: posts, 
            year: year, 
            month: month
        });
    });
};

exports.day = function (req, res) {
    var year  = +req.params.year,
        month = +req.params.month,
        day   = +req.params.day;

    provider.findByDay(year, month, day).then(function (posts) {
        res.render('index', { 
            app: application,
            posts: posts, 
            year: year, 
            month: month,
            day: day
        });
    });
};

exports.post = function (req, res) {
    provider.findBySlug(req.params.slug).then(function (post) {
        res.render('post', { 
            app: application,
            post: post
        });
    });
}

exports.searchByLabel = function (req, res) {
    provider
        .findByLabel(req.params.label)
        .then(function (posts) {
            res.render('index', {
                blog: blog,
                posts: posts
            });
    })
}

exports.pageParam = function (req, res, next, page) {
    if (page.match(/^\d+$/)) next();
    else next('route');
}

exports.formatParam = function (req, res, next, format) {
    if (['html', 'json'].indexOf(format) >= 0) next();
    else next('route');
}

exports.yearParam = function (req, res, next, year) {
    if (year.match(/^\d{4}$/)) next();
    else next('route');
}

exports.monthParam = function (req, res, next, month) {
    if (month.match(/^\d{2}$/) && +month > 0 && +month < 13) next();
    else next('route');
}

exports.dayParam = function (req, res, next, day) {
    if (day.match(/^\d{2}$/) && +day > 0 && +day < 32) next();
    else next('route');
}