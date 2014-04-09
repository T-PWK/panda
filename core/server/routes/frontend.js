(function () {
    'use strict';

    var cfg         = require('nconf'),
        ips         = require('../middleware/ips'),
        frontend    = require('../controllers/frontend');

    module.exports = function (server) {
        server.param('year', ips.siteIpCheck, frontend.yearParam);
        server.param('month', ips.siteIpCheck, frontend.monthParam);
        server.param('day', ips.siteIpCheck, frontend.dayParam);
        server.param('format', ips.siteIpCheck, frontend.formatParam);
        server.param('page', ips.siteIpCheck, frontend.pageParam);

        server.get('/',
            ips.siteIpCheck, frontend.middleware, frontend.index);          // Main page

        server.get(cfg.get('app:paginationUrl'),
            ips.siteIpCheck, frontend.middleware, frontend.index);          // Pagination

        // year
        server.get('/:year',
            ips.siteIpCheck, frontend.middleware, frontend.year);

        // slug
        server.get(cfg.get('app:postUrl'),
            ips.siteIpCheck, frontend.middleware, frontend.post);           // Post page

        // Use static page URL only if it is different than postUrl
        if (cfg.get('app:postUrl') !== cfg.get('app:pageUrl')) {
            server.get(cfg.get('app:pageUrl'),
                ips.siteIpCheck, frontend.middleware, frontend.post);       // Post page
        }

        // label
        server.get(cfg.get('app:labelUrl'),
            ips.siteIpCheck, frontend.middleware, frontend.searchByLabel);

        // label/pagination
        server.get(cfg.get('app:labelUrl') + cfg.get('app:paginationUrl'),
            ips.siteIpCheck, frontend.middleware, frontend.searchByLabel);

        // year/pagination
        server.get('/:year' + cfg.get('app:paginationUrl'),
            ips.siteIpCheck, frontend.middleware, frontend.year);

        // /year/month
        server.get('/:year/:month',
            ips.siteIpCheck, frontend.middleware, frontend.month);

        // /year/month/pagination
        server.get('/:year/:month' + cfg.get('app:paginationUrl'),
            ips.siteIpCheck, frontend.middleware, frontend.month);

        // year/month/day
        server.get('/:year/:month/:day',
            ips.siteIpCheck, frontend.middleware, frontend.day);

        // year/month/day/pagination
        server.get('/:year/:month/:day' + cfg.get('app:paginationUrl'),
            ips.siteIpCheck, frontend.middleware, frontend.day);
    };

})();