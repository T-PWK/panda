(function () {
    'use strict';

    var frontend = require('./frontend'),
        feeds = require('./feeds'),
        admin = require('./admin'),
        api = require('./api');

    module.exports = {
        frontend: frontend,
        feeds: feeds,
        admin: admin,
        api: api
    };

})();