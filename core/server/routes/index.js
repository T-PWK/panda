(function () {
    'use strict';

    var frontend = require('./frontend'),
        admin = require('./admin'),
        api = require('./api');

    module.exports = {
        frontend: frontend,
        admin: admin,
        api: api
    };

})();