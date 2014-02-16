var cfg              = require('nconf'),
    when             = require('when'),
    provider         = require('../providers').postProvider,
    pagination       = require('../helpers/pagination'),
    limit            = cfg.get('app:postsPerPage'),
    paginationRegexp = new RegExp(cfg.get('app:pageUrlRegExp'))
    
exports.index = function(req, res) {
    var page = req.params.page || 1, skip = limit * (page - 1);

    when.join(
        provider.findAll({ limit:limit, skip:skip }),
        provider.countAll()
    )
    .then(function (results) {
        res.locals({
            posts: results[0],
            pagination: pagination(req, results[1])
        });
        res.render('index');
    })
    .catch(function (err) {
        res.send(500, err);
    })
};

exports.year = function (req, res) {
    var year = +req.params.year;
    provider.findByYear(year).then(function (posts) {
        res.render('index', { 
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
            posts: posts, 
            year: year, 
            month: month,
            day: day
        });
    });
};

exports.post = function (req, res) {
    provider
        .findBySlug(req.params.slug)
        .then(function (post) {

            if (!post) return res.send(404);

            res.locals.post = post;
            res.render(post.page ? 'page' : 'post');
        });
}

exports.searchByLabel = function (req, res) {
    provider
        .findByLabel(req.params.label)
        .then(function (posts) {
            res.locals.posts = posts;
            res.render('index');
    })
}

exports.pageParam = function (req, res, next, page) {
    if (!page.match(/^\d+$/)) next('route');
    if (+page > 1) next();
    else {
        // Redirect to URL with no pagination if page 1 is used e.g. /page/1
        var path = req.path.replace(paginationRegexp, '');
        path = ('' === path) ? '/' : path; 
        res.redirect(path)
    };
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