var express     = require('express'),
    when        = require('when'),
    colors      = require('colors'),
    path        = require('path'),
    cfg         = require('nconf'),
    format      = require('util').format,
    routes      = require('./routes'),
    middleware  = require('./middleware');

function serverStartupInfo () {
    console.log(
        format("Panda v%s server is running...", module.exports.version).green,
        "\nCtrl+C to shut down".grey
    );

    if(cfg.get('development')) {
        console.log(format(
            "Listening on %s:%s", cfg.get('server:host'), cfg.get('server:port')).grey
        );
    }

    if(cfg.get('production')) {
        console.log(format("Panda application is available on %s", cfg.get('url')).grey);
    }

    // ensure server exists correctly on Ctrl+C
    process.on('SIGINT', function () {
        console.log("Panda server has shut down".red);
        process.exit(0);
    });
}

function setup (app) {
    when().then(function () {
        // ### Express Initialisation ###
        app.disable('x-powered-by');
        app.set('views', cfg.get('theme:paths:views'));
        app.set('admin views', path.join(__dirname, 'views'));

        // Set the view engine
        app.set('view engine', 'jade');

        // ## Express Middleware Setup
        middleware(app);

        // ## Routing
        routes.redirects(app); // Set up redirect route
        routes.feeds(app);     // Set up RSS routes
        routes.frontend(app);  // Set up Frontent routes
        routes.admin(app);     // Set up admin routes

        // ## Server Startup
        app.listen(
            cfg.get('server:port'), 
            cfg.get('server:host'), 
            serverStartupInfo
        );
    }).catch(function (err) {
        console.error(err.toString().red);
        throw err;
    });
}

function init (app) {
    if(!app) {
        app = express();
    }

    setup(app);
}

module.exports = init;

// Set Panda version
require('pkginfo')(module, 'version');