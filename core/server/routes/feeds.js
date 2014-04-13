(function () {
    'use strict';

    var feeds = require('../controllers/feeds');

    module.exports = function (server) {
        server.get('/rss', feeds.middleware, feeds.rss);
        server.get('/atom', feeds.middleware, feeds.atom);
        server.get('/sitemap.xml', feeds.sitemap);
    };

})();
