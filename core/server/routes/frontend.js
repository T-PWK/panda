(function () {
    'use strict';

    var cfg         = require('nconf'),
        ips         = require('../middleware/ips'),
        frontend    = require('../controllers/frontend');

    module.exports = function (app) {
        app.param('year', frontend.yearParam);
        app.param('month', frontend.monthParam);
        app.param('day', frontend.dayParam);
        app.param('format', frontend.formatParam);
        app.param('page', frontend.pageParam);

        app.get('/',
            ips.siteIpCheck, frontend.middleware, frontend.index);          // Main page

        app.get(cfg.get('app:paginationUrl'),
            ips.siteIpCheck, frontend.middleware, frontend.index);          // Pagination

        // year
        app.get('/:year',
            ips.siteIpCheck, frontend.middleware, frontend.year);

        // slug
        app.get(cfg.get('app:postUrl'),
            ips.siteIpCheck, frontend.middleware, frontend.post);           // Post page

        // Use static page URL only if it is different than postUrl
        if (cfg.get('app:postUrl') !== cfg.get('app:pageUrl')) {
            app.get(cfg.get('app:pageUrl'),
                ips.siteIpCheck, frontend.middleware, frontend.post);       // Post page
        }

        // label
        app.get(cfg.get('app:labelUrl'),
            ips.siteIpCheck, frontend.middleware, frontend.searchByLabel);

        // label/pagination
        app.get(cfg.get('app:labelUrl') + cfg.get('app:paginationUrl'),
            ips.siteIpCheck, frontend.middleware, frontend.searchByLabel);

        // year/pagination
        app.get('/:year' + cfg.get('app:paginationUrl'),
            ips.siteIpCheck, frontend.middleware, frontend.year);

        // /year/month
        app.get('/:year/:month',
            ips.siteIpCheck, frontend.middleware, frontend.month);

        // /year/month/pagination
        app.get('/:year/:month' + cfg.get('app:paginationUrl'),
            ips.siteIpCheck, frontend.middleware, frontend.month);

        // year/month/day
        app.get('/:year/:month/:day',
            ips.siteIpCheck, frontend.middleware, frontend.day);

        // year/month/day/pagination
        app.get('/:year/:month/:day' + cfg.get('app:paginationUrl'),
            ips.siteIpCheck, frontend.middleware, frontend.day);
    };

})();