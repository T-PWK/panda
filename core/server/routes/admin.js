(function () {
    'use strict';

    var express     = require('express'),
        admin       = require('../controllers/admin'),
        auth        = require('../middleware/authentication'),
        ips         = require('../middleware/ips');

    module.exports = function (app) {
        var loginRoute  = express.Router(),
            logoutRoute = express.Router(),
            adminRoute  = express.Router();

        loginRoute.use(ips.adminIpCheck)
            .route('/').get(admin.loginView).post(admin.login);

        logoutRoute.use(ips.adminIpCheck)
            .get('/', admin.logout);

        adminRoute.use(ips.adminIpCheck).use(auth.authCheck)
            .get('/', admin.index)
            .get('/partial/:name', admin.partial)

        app.use('/login', loginRoute);
        app.use('/logout', logoutRoute);
        app.use('/admin', adminRoute);
    };

})();