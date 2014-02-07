var express     = require('express'),
    when        = require('when'),
    colors      = require('colors'),
    path        = require('path')
    cfg         = require('nconf'),
    format      = require('util').format,
    routes      = require('./routes'),
    middleware  = require('./middleware');

// var theme = 'taotao';
var theme = 'casper';

function serverStartupInfo () {

    // TODO:
    // - use configuration values for server startup

    console.log(
        "Panda server is running...".green,
        "\nCtrl+C to shut down".grey
    );

    if(cfg.get('is:development')) {
        console.log(format(
            "Listening on %s:%s", cfg.get('server:host'), cfg.get('server:port')).grey
        );
    }

    if(cfg.get('is:production')) {
        console.log(format("Panda application is available on %s", cfg.get('url')).grey);
    }

    // ensure server exists correctly on Ctrl+C
    process.on('SIGINT', function () {
        console.log("Panda server has shut down".red);
        process.exit(0);
    })
}

function setup (app) {
    when().then(function () {
        // ### Express Initialisation ###
        app.set('views', cfg.get('theme:viewPath'));

        // Set the view engine
        app.set('view engine', 'jade');

        // ## Express Middleware Setup
        middleware(app)

        // ## Routing

        // Set up Frontent routes
        routes.frontend(app);

        // ## Server Startup
        app.listen(
            cfg.get('server:port'), 
            cfg.get('server:host'), 
            serverStartupInfo
        );
    }).catch(function (err) {
        console.error(err.toString().red)
        throw err;
    })
}

function init (app) {
    if(!app) {
        app = express();
    }

    setup(app);
}

module.exports = init;