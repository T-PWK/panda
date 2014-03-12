var api = require('../controllers/api');

module.exports = function (server) {
    server.get('/api/v1/posts', api.posts);
    server.get('/api/v1/pages', api.pages);
};