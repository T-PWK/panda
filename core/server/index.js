(function () {
    'use strict';

    var resource    = require('express-resource'),
        express     = require('express'),
        when        = require('when'),
        colors      = require('colors'),
        path        = require('path'),
        cfg         = require('nconf'),
        format      = require('util').format;

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

    function updateServerSettings(app) {
        // ### Express Initialisation ###
        app.disable('x-powered-by');
        app.set('views', cfg.get('theme:paths:views'));
        app.set('admin views', path.join(__dirname, 'views'));

        // Set the view engine
        app.set('view engine', 'jade');

        // Minimize JSON output in production environment
        if (cfg.get('production')) {
            app.set('json spaces', 0);
        }

        return app;
    }

    function listen(app) {
        app.listen(cfg.get('server:port'), cfg.get('server:host'), serverStartupInfo);
    }

    function setup (app) {

        // Update views path on theme paths view change
        cfg.on('set:theme:paths:views', function() {
            app.set('views', cfg.get('theme:paths:views'));
            app.cache = {};
        });

        when.resolve(app)
            .then(updateServerSettings)
            .then(require('./middleware'))
            .then(listen)
            .otherwise(function (err) {
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
    require('pkginfo')(module, 'version'); // Set Panda version

}());