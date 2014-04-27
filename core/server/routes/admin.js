(function () {
    'use strict';

    var cfg             = require('nconf'),
        express         = require('express'),
        passport        = require('passport'),
        bodyParser      = require('body-parser'),
        sessionFlush    = require('connect-flash'),
        session         = require('cookie-session'),
        admin           = require('./../controllers/admin'),
        auth            = require('./../middleware/authentication'),
        ips             = require('./../middleware/ips');

    module.exports = function (app) {
        var loginRoute  = express.Router(),
            adminRoute  = express.Router(),
            logoutRoute = express.Router();

        logoutRoute
            .use(session({
//                maxage: cfg.get('admin:sessionCookieMaxAge'),
                secret: cfg.get('admin:sessionSecret')
            }))
            .use(passport.initialize())
            .use(passport.session())
            .get('/', admin.logout);

        loginRoute
            .use(ips.adminIpCheck)
            .use(session({
//                maxage: cfg.get('admin:sessionCookieMaxAge'),
                secret: cfg.get('admin:sessionSecret')
            }))
            .use(sessionFlush())
            .use(passport.initialize())
            .use(passport.session())
            .use(bodyParser())
            .route('')
                .get(admin.loginView)
                .post(admin.login);

        adminRoute
            .use(ips.adminIpCheck)
            .use(session({
//                maxage: cfg.get('admin:sessionCookieMaxAge'),
                secret: cfg.get('admin:sessionSecret')
            }))
            .use(passport.initialize())
            .use(passport.session())
            .use(auth.authCheck)
            .get('/', admin.index)
            .get('/partial/:name', admin.partial);


        app.use('/logout', logoutRoute);
        app.use('/login', loginRoute);
        app.use('/admin', adminRoute);
    };

})();