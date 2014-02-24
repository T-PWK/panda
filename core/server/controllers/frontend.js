var cfg              = require('nconf'),
    when             = require('when'),
    provider         = require('../providers').postProvider,
    pagination       = require('../helpers/pagination'),
    limit            = cfg.get('app:postsPerPage'),
    paginationRegexp = new RegExp(cfg.get('app:pageUrlRegExp'))

exports.middleware = function (req, res, next) {
    when.join(
        provider.getLabelsInfo(),
        provider.getArchiveInfo()
    )
    .spread(function (labels, archives) {
        res.locals.labels = labels;
        res.locals.archives = archives;
    })
    .then(next);
}

exports.index = function(req, res) {
    var page = req.params.page || 1, skip = limit * (page - 1);

    when.join(
        provider.findAll({ limit:limit, skip:skip }),
        provider.count()
    )
    .spread(function (posts, count, labels, archives) {
        res.locals.posts = posts;
        res.locals.pagination = pagination(req, count);

        res.render('index');
    })
    .catch(function (err) {
        res.send(500, err.toString());
    })
};

exports.year = function (req, res) {
    var page = req.params.page || 1, skip = limit * (page - 1), year = +req.params.year;

    when.join(
        provider.findByYear({ year: year, skip:skip, limit:limit }),
        provider.count({ year: year })
    )
    .then(function (results) {
        res.locals.posts = results[0];
        res.locals.year = year;
        res.locals.pagination = pagination(req, results[1]);

        res.render('index');
    });
};

exports.month = function (req, res) {
    var page = req.params.page || 1, skip = limit * (page - 1), 
        year = +req.params.year, month = +req.params.month;

    when.join(
        provider.findByMonth({ month:month, year: year, skip:skip, limit:limit }),
        provider.count({ month:month, year: year })
    )
    .then(function (results) {
        res.locals.posts = results[0];
        res.locals.year = year;
        res.locals.month = month;
        res.locals.pagination = pagination(req, results[1]);

        res.render('index');
    });
};

exports.day = function (req, res) {
    var page = req.params.page || 1, skip = limit * (page - 1), year = +req.params.year,
        month = +req.params.month, day = +req.params.day;

    when.join(
        provider.findByDay({ day:day, month:month, year: year, skip:skip, limit:limit }),
        provider.count({ day:day, month:month, year: year })
    )
    .then(function (results) {
        res.locals.posts = results[0];
        res.locals.year = year;
        res.locals.month = month;
        res.locals.day = day;
        res.locals.pagination = pagination(req, results[1]);

        res.render('index');
    });
};

exports.post = function (req, res, next) {
    provider
        .findBySlug(req.params.slug)
        .then(function (post) {
            // if there is no post with the given slug, check if there is no other route
            // which could handle that request e.g. /:year
            if (!post) return next('route');

            res.locals.post = post;

            res.render(post.page ? 'page' : 'post');
        })
        .catch(function (error) {
            res.send(500);
        });
}

exports.searchByLabel = function (req, res) {
    var page = req.params.page || 1, skip = limit * (page - 1);

    when.join(
        provider.findByLabel({ label:req.params.label, skip:skip, limit:limit }),
        provider.count({ label: req.params.label })
    )
    .spread(function (posts, count) {
        res.locals.posts = posts;
        res.locals.pagination = pagination(req, count)
        
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