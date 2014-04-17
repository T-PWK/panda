(function () {
    'use strict';

    var express     = require('express'),
        ips         = require('./../middleware/ips'),
        feeds       = require('./../controllers/feeds');

    module.exports = function (app) {
        var routes = express.Router();

        routes
            .use(ips.siteIpCheck)               // IP check for all requests
            .get('/sitemap.xml', feeds.sitemap) // sitemap request handler
            .use(feeds.middleware)              // feeds middleware for /rss and /atom
            .get('/rss', feeds.rss)
            .get('/atom', feeds.atom);

        app.use('/', routes);
    };

})();
