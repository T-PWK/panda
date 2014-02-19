var feeds = require('../controllers/feeds')

module.exports = function (server) {
    server.get('/rss', feeds.rss);
    server.get('/atom', feeds.atom);
}
