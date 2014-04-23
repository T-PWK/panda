(function () {
    'use strict';

    var express         = require('express'),
        cfg             = require('nconf'),
        path            = require('path'),
        moment          = require('moment'),
        logger          = require('morgan'),
        serveStatic     = require('serve-static'),
        compress        = require('compression'),
        passport        = require('passport'),
        errorHandler    = require('errorhandler'),
        cookieSession   = require('cookie-session'),
        sessionFlush    = require('connect-flash'),
        responseTime    = require('response-time'),
        favicon         = require('./favicon'),
        staticHandler   = require('./static'),
        auth            = require('./authentication'),
        ips             = require('./ips'),
        routes          = require('./../routes'),
        tplHelper       = require('./../helpers/templatehelper');

    function setup(app) {
        // Set up authentication
        auth();

        // Set the favicon
        app.get('/favicon.ico', favicon(
            path.resolve(__dirname,'../../shared/panda.ico'),
            { maxAge: cfg.get('app:staticCacheAge') }
        ));

        // Set the requests logger
        app.use(logger(cfg.get('development') ? 'dev' : undefined));

        if (cfg.get('app:httpCompression')) {
            app.use(compress({ threshold: '2kb' }));
        }

        app.use(responseTime());

        // Set theme static files
        app.use('/assets', staticHandler);
        app.use('/shared', serveStatic(cfg.get('paths:sharedStatic'), { maxAge: cfg.get('app:staticCacheAge') }));
        app.use('/client', serveStatic(cfg.get('paths:clientStatic'), { maxAge: cfg.get('app:staticCacheAge') }));

        // Set the template helper component
        tplHelper(app);

        // Set the routes
        routes.feeds(app);      // Set up RSS routes

        if (cfg.get('admin:enable')) {
            routes.admin(app);  // Set up admin routes
            routes.api(app);    // Set up API routes
        }

        routes.frontend(app);   // Set up Frontend routes

        // Set error handler for development mode only
        if (cfg.get('development')) {
            app.use(errorHandler());
        }

        return app;
    }

    module.exports = setup;

})();