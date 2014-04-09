(function () {
    "use strict";

    var api     = require('../controllers/api'),
        auth    = require('../middleware/authentication'),
        ips     = require('../middleware/ips');

    module.exports = function (server) {
        // Posts API
        server.all('/api/v1/*', ips.adminIpCheck, auth.authCheck);

        server.resource('api/v1/posts', api.posts);
        server.resource('api/v1/posts/infos', api.postsinfo);

        // Labels API
        server.resource('api/v1/labels', api.labels);

        // Themes API
        server.resource('api/v1/themes/site', api.themes);
        server.resource('api/v1/themes/admin', api.adminthemes);

        // IP Restriction API
        server.resource('api/v1/ips/:type', api.ips);

        // Redirects API
        server.resource('api/v1/config/redirects', api.redirects);

        // Settings API
        server.resource('api/v1/settings', api.settings);

        // User API
        server.resource('api/v1/user', api.users);
    };

}());