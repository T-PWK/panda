var express     = require('express'),
    when        = require('when'),
    colors      = require('colors'),
    path        = require('path')
    cfg         = require('nconf'),
    routes      = require('./routes'),
    middleware  = require('./middleware');

// var theme = 'taotao';
var theme = 'casper';

function serverStartupInfo () {

    // TODO:
    // - update configuration - set port, url and host
    // - use configuration values for server startup

    console.log(
        "Panda server is running...".green,
        "\nCtrl+C to shut down".grey
    );

    if(cfg.get('is:development')) {
        console.log(("Listening on :" + (process.env.PORT || 3000)).grey);
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

        app.set('port', process.env.PORT || 3000);
        app.set('views', path.join(__dirname, '../../content/themes', theme));

        // Set the view engine
        app.set('view engine', 'jade');

        // ## Express Middleware Setup
        middleware(app)

        // ## Routing

        // Set up Frontent routes
        routes.frontend(app);

        // ## Server Startup

        app.listen(app.get('port'), serverStartupInfo);

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