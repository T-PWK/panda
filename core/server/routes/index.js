var frontend    = require('./frontend'),
    feeds       = require('./feeds'),
    redirects   = require('./redirects'),
    admin       = require('./admin'),
    api         = require('./api'),
    auth        = require('./authentication');

module.exports = {
    frontend:   frontend,
    feeds:      feeds,
    redirects:  redirects,
    admin:      admin,
    api:        api,
    auth:       auth
};