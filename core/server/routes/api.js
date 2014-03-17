var api = require('../controllers/api');

function notImplemented (req, res) {
    res.json({ info: 'API not implemented' });
}

module.exports = function (server) {
    // Posts
    server.resource('api/v1/posts', api.posts);
    // server.get('/api/v1/posts', api.posts);
    // server.get('/api/v1/posts/archive', notImplemented);
    // server.get('/api/v1/posts/count', api.postCountInfo);
    // server.get('/api/v1/posts/label/:label', notImplemented);
    // server.get('/api/v1/posts/:id', notImplemented);

    // // Labels
    // server.get('/api/v1/labels', api.labels);
    // server.get('/api/v1/labels/:id', notImplemented);
};