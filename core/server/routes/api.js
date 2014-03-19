var api = require('../controllers/api');

module.exports = function (server) {
    // Posts
    server.resource('api/v1/posts', api.posts);
    server.resource('api/v1/posts/infos', api.postsinfo);
    server.resource('api/v1/labels', api.labels);
    server.resource('api/v1/themes/site', api.themes);
    server.resource('api/v1/themes/admin', api.adminthemes);

    server.resource('api/v1/config/redirects', api.redirects);

    // server.get('/api/v1/posts/archive', notImplemented);
    // server.get('/api/v1/posts/count', api.postCountInfo);
};