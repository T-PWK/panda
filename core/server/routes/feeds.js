(function () {
    'use strict';

    var ips         = require('./../middleware/ips'),
        feeds       = require('./../controllers/feeds'),
        robots      = require('../controllers/robots');

    module.exports = function (app) {
//        app.get('/sitemap.xml', ips.siteIpCheck, feeds.sitemap);
        app.get('/robots.txt', ips.siteIpCheck, robots);
//        app.get('/rss', ips.siteIpCheck, feeds.middleware, feeds.rss);
//        app.get('/atom', ips.siteIpCheck, feeds.middleware, feeds.atom);
    };

})();
