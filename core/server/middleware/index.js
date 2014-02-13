var express     = require('express'),
    path        = require('path'),
    cfg         = require('nconf'),
    tplHelper   = require('../helpers/templatehelper');

function setup (app) {
    // Set the favicon
    app.use(express.favicon('core/shared/panda.ico'));

    // Set the requests logger
    if (cfg.get('is:development')) {
        app.use(express.logger('dev'));
    } else {
        app.use(express.logger())
    }

    if (cfg.get('app:httpCompression')) {
        app.use(express.compress());
    }

    // app.use(express.json());
    // app.use(express.urlencoded());
    // app.use(express.methodOverride());
    app.use(app.router);

    // Set theme static files
    app.use('/assets', express.static(cfg.get('theme:staticPath')));

    // Set error handler for development mode only
    if (cfg.get('is:development')) {
        app.use(express.errorHandler());
    }

    // Set the template helper component
    tplHelper(app);
}

module.exports = setup;