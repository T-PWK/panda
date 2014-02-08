var provider = require('../providers').postProvider;
var blog = {
    cover: null,
    logo: null,
    url: 'http://127.0.0.1:3000',
    title: "Tom's Blog",
    description: 'To code, or not to code ...',
    meta_title: 'Blog metatitle'
}

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
        res.render('year', { 
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
        res.render('month', { 
            blog: blog, 
            posts: posts, 
            year: year, 
            month: month,
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

exports.yearParam = function (req, res, next, year) {
    if (year.match(/^\d{4}$/)) next();
    else next('route');
}

exports.monthParam = function (req, res, next, month) {
    if (month.match(/^\d{2}$/) && +month > 0 && +month < 13) next();
    else next('route');
}