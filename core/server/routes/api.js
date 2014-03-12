var api = require('../controllers/api');

module.exports = function (server) {
    // Posts
    server.get('/api/v1/posts', api.posts);
    server.get('/api/v1/posts/count/published', api.postsCountByPublishedAt);

    // Pages
    server.get('/api/v1/pages', api.pages);
    server.get('/api/v1/pages/count/published', api.pagesCountByPublishedAt);
};