(function () {
    'use strict';

    var express         = require('express'),
        favicon         = require('static-favicon'),
        logger          = require('morgan'),
        serveStatic     = require('serve-static'),
        compress        = require('compression'),
        path            = require('path'),
        cfg             = require('nconf'),
        passport        = require('passport'),
        moment          = require('moment'),
        staticHanlder   = require('./static'),
        auth            = require('./authentication'),
        errorHandler    = require('errorhandler'),
//        cookieParser    = require('cookie-parser'),//TODO: remove
        cookieSession   = require('cookie-session'),
        sessionFlush    = require('connect-flash'),
        bodyParser      = require('body-parser'),
        routes          = require('./../routes'),
        tplHelper       = require('./../helpers/templatehelper'),
        hash            = cfg.get('hash');

    function setup(app) {
        // Set up authentication
        auth();

        // Set the favicon
        app.use(favicon(path.resolve(__dirname,'../../shared/panda.ico')));

        // Set the requests logger
        app.use(logger(cfg.get('development') ? 'dev' : undefined));

        if (cfg.get('app:httpCompression')) {
            app.use(compress());
        }

        // Set theme static files
        app.use('/assets', staticHanlder);
        app.use('/shared', serveStatic(cfg.get('paths:sharedStatic'), { maxAge: cfg.get('app:staticCacheAge') }));
        app.use('/client', serveStatic(cfg.get('paths:clientStatic'), { maxAge: cfg.get('app:staticCacheAge') }));

//        app.use(cookieParser());
        app.use(bodyParser());
        app.use(cookieSession({
            cookie: { maxAge: cfg.get('admin:sessionCookieMaxAge') },
            secret: cfg.get('admin:sessionSecret')
        }));
        app.use(sessionFlush());

        app.use(passport.initialize());
        app.use(passport.session());

        // Set the template helper component
        tplHelper(app);

        // Set the routes
        routes.robots(app);     // Set up robots.txt route
        routes.feeds(app);      // Set up RSS routes

        if (cfg.get('admin:enable')) {
            routes.auth(app);   // Set up authentication routes
            routes.admin(app);  // Set up admin routes
            routes.api(app);    // Set up API routes
        }

        // Set 'Powered By' HTTP header
        app.use(require('./poweredBy'));

        // Set no-cache HTTP headers for pages
        app.use(require('./nocache'));

        routes.redirects(app);  // Set up redirect route
        routes.frontend(app);   // Set up Frontend routes


        // Set error handler for development mode only
        if (cfg.get('development')) {
            app.use(errorHandler());
        }

        return app;
    }

    module.exports = setup;

})();