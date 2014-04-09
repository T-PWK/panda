(function () {
    'use strict';

    var admin   = require('../controllers/admin'),
        auth    = require('../middleware/authentication');

    module.exports = function (server) {
        server.get('/login', admin.login);
        server.get('/logout', admin.logout);
        server.get('/admin', auth.authCheck, admin.index);
        server.get('/admin/partial/:name', auth.authCheck, admin.partial);
    };

})();