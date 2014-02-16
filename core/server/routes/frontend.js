var frontend    = require('../controllers/frontend')
    cfg         = require('nconf');

module.exports = function (server) {
    server.param('year', frontend.yearParam);
    server.param('month', frontend.monthParam);
    server.param('day', frontend.dayParam);
    server.param('format', frontend.formatParam);
    server.param('page', frontend.pageParam);

    server.get('/', frontend.index);                        // Main page
    server.get(cfg.get('app:urlFormat'), frontend.post);    // Post page
    server.get('/page/:page', frontend.index);              // Pagination

    server.get('/search/label/:label', frontend.searchByLabel);

    server.get('/:year', frontend.year);
    server.get('/:year/:month', frontend.month);
    server.get('/:year/:month/:day', frontend.day);
}