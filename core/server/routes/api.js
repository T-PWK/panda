(function () {
    "use strict";

    var api = require('../controllers/api');

    module.exports = function (server) {
        // Posts API
        server.resource('api/v1/posts', api.posts);
        server.resource('api/v1/posts/infos', api.postsinfo);

        // Labels API
        server.resource('api/v1/labels', api.labels);

        // Themes API
        server.resource('api/v1/themes/site', api.themes);
        server.resource('api/v1/themes/admin', api.adminthemes);

        // Redirects API
        server.resource('api/v1/config/redirects', api.redirects);

        // Settings API
        server.resource('api/v1/settings', api.settings);

        // User API
        server.resource('api/v1/user', api.users);
    };

}());