(function () {
    'use strict';

    var admin   = require('../controllers/admin'),
        auth    = require('../middleware/authentication'),
        ips     = require('../middleware/ips');

    module.exports = function (server) {
        server.get('/login', ips.adminIpCheck, admin.login);
        server.get('/logout', ips.adminIpCheck, admin.logout);
        server.get('/admin', ips.adminIpCheck, auth.authCheck, admin.index);
        server.get('/admin/partial/:name', ips.adminIpCheck, auth.authCheck, admin.partial);
    };

})();