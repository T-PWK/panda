(function () {
    'use strict';

    var frontend = require('../controllers/frontend'),
        cfg = require('nconf');

    module.exports = function (server) {
        server.param('year', frontend.yearParam);
        server.param('month', frontend.monthParam);
        server.param('day', frontend.dayParam);
        server.param('format', frontend.formatParam);
        server.param('page', frontend.pageParam);

        server.get('/', frontend.middleware, frontend.index);                           // Main page
        server.get(cfg.get('app:paginationUrl'), frontend.middleware, frontend.index);  // Pagination

        // year
        server.get('/:year', frontend.middleware, frontend.year);

        // slug
        server.get(cfg.get('app:postUrl'), frontend.middleware, frontend.post);         // Post page

        // Use static page URL only if it is different than postUrl
        if (cfg.get('app:postUrl') !== cfg.get('app:pageUrl')) {
            server.get(cfg.get('app:pageUrl'), frontend.middleware, frontend.post);     // Post page
        }

        // label
        server.get(cfg.get('app:labelUrl'),
            frontend.middleware, frontend.searchByLabel);

        // label/pagination
        server.get(cfg.get('app:labelUrl') + cfg.get('app:paginationUrl'),
            frontend.middleware, frontend.searchByLabel);

        // year/pagination
        server.get('/:year' + cfg.get('app:paginationUrl'),
            frontend.middleware, frontend.year);

        // /year/month
        server.get('/:year/:month', frontend.middleware, frontend.month);

        // /year/month/pagination
        server.get('/:year/:month' + cfg.get('app:paginationUrl'),
            frontend.middleware, frontend.month);

        // year/month/day
        server.get('/:year/:month/:day', frontend.middleware, frontend.day);

        // year/month/day/pagination
        server.get('/:year/:month/:day' + cfg.get('app:paginationUrl'),
            frontend.middleware, frontend.day);
    };

})();