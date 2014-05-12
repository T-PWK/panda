(function () {
    'use strict';

    var cfg         = require('nconf'),
        express     = require('express'),
        ips         = require('../middleware/ips'),
        poweredBy   = require('../middleware/poweredBy'),
        nocache     = require('../middleware/nocache'),
        frontend    = require('../controllers/frontend'),
        redirects   = require('../controllers/redirects'),
        plugins     = require('../providers').pluginsService;

    module.exports = function (app) {

        var route = express.Router();

        route
            .use(ips.siteIpCheck)
            .use(poweredBy)
            .use(nocache)
            .use(plugins.request.bind(plugins))
            .param('year', frontend.yearParam)
            .param('month', frontend.monthParam)
            .param('day', frontend.dayParam)
            .param('format', frontend.formatParam)
            .param('page', frontend.pageParam)
            .get('*', redirects)                                                                // Redirects
            .get('/', frontend.index)                                                           // Main page
            .get(cfg.get('app:paginationUrl'), frontend.index)                                  // Main page - pagination
            .get('/:year', frontend.year)                                                       // Year index
            .get(cfg.get('app:postUrl'), frontend.post)                                         // Post page
            .get(cfg.get('app:pageUrl'), frontend.post)                                         // Static page
            .get(cfg.get('app:labelUrl'), frontend.searchByLabel)                               // Labels
            .get(cfg.get('app:labelUrl') + cfg.get('app:paginationUrl'), frontend.searchByLabel)// Labels pagination
            .get('/:year' + cfg.get('app:paginationUrl'), frontend.year)                        // Year pagination
            .get('/:year/:month', frontend.month)                                               // Year / month
            .get('/:year/:month' + cfg.get('app:paginationUrl'), frontend.month)                // Year / month / pagination
            .get('/:year/:month/:day', frontend.day)                                            // Year / month /day
            .get('/:year/:month/:day' + cfg.get('app:paginationUrl'), frontend.day);            // Year / month /day / pagination

        app.use('/', route);
    };

})();