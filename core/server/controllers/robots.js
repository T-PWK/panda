(function () {
    'use strict';

    var cfg = require('nconf'),
        fs = require('fs'),
        join = require('path').join,
        _ = require('underscore');

    module.exports = function (req, res, next) {
        var tpl, robotsLocals = {
                disallow: cfg.get('app:robots:disallow'),
                allow: cfg.get('app:robots:allow')
            },
            path = join(cfg.get('paths:coreShared'), 'robots.txt'),
            locals = _.extend({}, robotsLocals, res.app.locals);

        // Check if a file can be served from cache
        if (tpl) return res.type('txt').end(tpl(locals));

        // Render template from a robots file
        fs.readFile(path, function (err, file) {
            if (err) return next(err);

            tpl = _.template(file.toString('utf8'));
            res.type('txt').end(tpl(locals));
        });
    };

})();