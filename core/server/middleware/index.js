var express = require('express'),
    path    = require('path'),
    cfg     = require('nconf');

// var theme = 'taotao'; // TODO: move it to configuraiton
var theme = 'casper'; // TODO: move it to configuraiton

function setup (app) {
    // Set the favicon
    app.use(express.favicon('core/shared/panda.ico'));

    // Set the requests logger
    if(cfg.get('is:development')) {
        app.use(express.logger('dev'));
    } else {
        app.use(express.logger())
    }

    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(app.router);

    // Set theme static files
    app.use(express.static(path.join(__dirname, '../../../content/themes', theme)));

    // Set error handler for development mode only
    if (cfg.get('is:development')) {
      app.use(express.errorHandler());
    }

    // Set the template helper component
    app.locals.helper = require('../helpers/templatehelper');
    app.locals.pretty = true;
}

module.exports = setup;