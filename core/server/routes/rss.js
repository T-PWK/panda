var rss = require('../controllers/rss')

module.exports = function (server) {
    server.get('/rss', rss.rss);
}