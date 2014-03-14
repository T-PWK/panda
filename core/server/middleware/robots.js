var cfg     = require('nconf'),
    fs      = require('fs'),
    join    = require('path').join,
    _       = require('underscore');

module.exports = function robots (path) {
    var tpl, robotsLocals = { 
        disallow: cfg.get('app:robots:disallow'), 
        allow: cfg.get('app:robots:allow') 
    };

    path = path || join(cfg.get('paths:coreShared'), 'robots.txt');

    return function (req, res, next) {
        if ('/robots.txt' === req.url) {
            var locals = _.extend({}, robotsLocals, res.app.locals);

            if (tpl) return res.type('txt').end(tpl(locals));

            fs.readFile(path, function (err, file) {
                if (err) return next(err);

                tpl = _.template(file.toString('utf8'));
                res.type('txt').end(tpl(locals));
            });
        } else {
            next();
        }
    };
};