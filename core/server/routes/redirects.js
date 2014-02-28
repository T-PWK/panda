var redirects = require('../controllers/redirects')

module.exports = function (server) {
    server.get(/^\/(?!assets\/).*/, redirects);
}
