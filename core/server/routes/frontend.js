var frontend = require('../controllers/frontend');

module.exports = function (server) {
    server.param('year', frontend.yearParam);
    server.param('month', frontend.monthParam);
    server.get('/', frontend.index);
    server.get('/:year', frontend.year);
    server.get('/:year/:month', frontend.month);
    server.get('/:year/:month/:slug.:format', frontend.post);
}