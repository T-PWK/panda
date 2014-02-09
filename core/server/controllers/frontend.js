var provider      = require('../providers').postProvider
    cfg           = require('nconf')
    Blog          = require('../models/blog');
    
var blog = new Blog({
    metaTitle:      cfg.get('app:defaultMetaTitle'),
    metaDesc:       cfg.get('app:defaultMetaDesc'),
    metaKeywords:   cfg.get('app:defaultKeywords'),
    title:          cfg.get('app:title'),
    description:    cfg.get('app:description'),
    url:            cfg.get('url')
});

exports.index = function(req, res) {
    provider.findAll().then(function (posts) {
        res.render('index', { 
            blog: blog,
            posts: posts,
            bodyClass: undefined
        });
    }, function (err) {
        res.send(500, err);
    });
};

exports.year = function (req, res) {
    var year = +req.params.year;
    provider.findByYear(year).then(function (posts) {
        res.render('index', { 
            blog: blog,
            posts: posts, 
            year: year,
            bodyClass: undefined
        });
    });
};

exports.month = function (req, res) {
    var year  = +req.params.year,
        month = +req.params.month;

    provider.findByMonth(year, month).then(function (posts) {
        res.render('index', { 
            blog: blog,
            posts: posts, 
            year: year, 
            month: month,
            bodyClass: undefined
        });
    });
};

exports.day = function (req, res) {
    var year  = +req.params.year,
        month = +req.params.month,
        day   = +req.params.day;

    provider.findByDay(year, month, day).then(function (posts) {
        res.render('index', { 
            blog: blog,
            posts: posts, 
            year: year, 
            month: month,
            day: day,
            bodyClass: undefined
        });
    });
};

exports.post = function (req, res) {
    provider.findBySlug(req.params.slug).then(function (post) {
        res.render('post', { 
            blog: blog,
            post: post,
            bodyClass: 'post-template'
        });
    });
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