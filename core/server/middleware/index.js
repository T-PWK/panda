var express     = require('express'),
    path        = require('path'),
    cfg         = require('nconf'),
    passport    = require('passport'),
    auth        = require('./authentication'),
    tplHelper   = require('../helpers/templatehelper'),
    hash        = cfg.get('hash'),
    staticFn    = require('./static');

function setup (app) {
    // Set up authentication
    auth();

    // Set the favicon
    app.use(express.favicon('core/shared/panda.ico'));

    // Set the requests logger
    if (cfg.get('development')) {
        app.use(express.logger('dev'));
    } else {
        app.use(express.logger());
    }

    if (cfg.get('app:httpCompression')) {
        app.use(express.compress());
    }

    // Set theme static files
    app.use('/assets', staticFn);
    app.use('/shared',
        express.static(cfg.get('paths:sharedStatic'), { maxAge: cfg.get('app:staticCacheAge') }));
    app.use('/client' + (hash ? '/'+ hash : ''),
        express.static(cfg.get('paths:clientStatic'), { maxAge: 86400000 }));

    // robots.txt handler
    app.use(require('./robots')());

    // Set 'Powered By' HTTP header
    app.use(require('./poweredBy'));

    // Set no-cache HTTP headers for pages
    app.use(require('./nocache'));

    app.use(express.cookieParser());
    app.use(express.urlencoded())
    app.use(express.json())
    app.use(express.session({ secret: 'keyboard cat' }));
    app.use(passport.initialize());
    app.use(passport.session());

    // Set the template helper component
    tplHelper(app);

    // Protect admin calls
    app.use('/admin', auth.loggedIn);

    // Set the router
    app.use(app.router);

    console.log(app.routes)

    // Set error handler for development mode only
    if (cfg.get('development')) {
        app.use(express.errorHandler());
    }
}

module.exports = setup;