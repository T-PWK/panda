var frontend = require('../controllers/frontend');

module.exports = function (server) {
    server.param('year', frontend.yearParam);
    server.param('month', frontend.monthParam);
    server.param('day', frontend.dayParam);
    server.param('format', frontend.formatParam);

    server.get('/', frontend.index);
    server.get('/:year', frontend.year);
    server.get('/:year/:month', frontend.month);
    server.get('/:year/:month/:day', frontend.day);
    server.get('/:year?/:month?/:day?/:slug.:format?', frontend.post);
}