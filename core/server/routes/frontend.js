var frontend    = require('../controllers/frontend'),
    cfg         = require('nconf');

module.exports = function (server) {
    server.param('year', frontend.yearParam);
    server.param('month', frontend.monthParam);
    server.param('day', frontend.dayParam);
    server.param('format', frontend.formatParam);
    server.param('page', frontend.pageParam);

    server.get('/', frontend.middleware, frontend.index);                               // Main page
    server.get(cfg.get('app:postUrl'), frontend.middleware, frontend.post);       // Post page
    server.get(cfg.get('app:paginationUrl'), frontend.middleware, frontend.index);// Pagination

    server.get(cfg.get('app:labelUrl'), 
        frontend.middleware, frontend.searchByLabel);

    server.get(cfg.get('app:labelUrl') + cfg.get('app:paginationUrl'), 
        frontend.middleware, frontend.searchByLabel);

    server.get('/:year', frontend.middleware, frontend.year);

    server.get('/:year' + cfg.get('app:paginationUrl'), 
        frontend.middleware, frontend.year);

    server.get('/:year/:month', frontend.middleware, frontend.month);

    server.get('/:year/:month' + cfg.get('app:paginationUrl'), 
        frontend.middleware, frontend.month);

    server.get('/:year/:month/:day', frontend.middleware, frontend.day);

    server.get('/:year/:month/:day' + cfg.get('app:paginationUrl'), 
        frontend.middleware, frontend.day);
};