(function () {
    'use strict';

    var cfg             = require('nconf'),
        express         = require('express'),
        passport        = require('passport'),
        bodyParser      = require('body-parser'),
        sessionFlush    = require('connect-flash'),
        cookieSession   = require('cookie-session'),
        admin           = require('./../controllers/admin'),
        auth            = require('./../middleware/authentication'),
        ips             = require('./../middleware/ips');

    module.exports = function (app) {
        var loginRoute  = express.Router(),
            adminRoute  = express.Router();

        loginRoute
            .use(ips.adminIpCheck)
            .use(cookieSession({
                cookie: { maxAge: cfg.get('admin:sessionCookieMaxAge') },
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
            .use(cookieSession({
                cookie: { maxAge: cfg.get('admin:sessionCookieMaxAge') },
                secret: cfg.get('admin:sessionSecret')
            }))
            .use(passport.initialize())
            .use(passport.session())
            .use(auth.authCheck)
            .get('/', admin.index)
            .get('/partial/:name', admin.partial);


        app.get('/logout', admin.logout);
        app.use('/login', loginRoute);
        app.use('/admin', adminRoute);
    };

})();