(function () {
    'use strict';

    var when            = require('when'),
        cfg             = require('nconf'),
        config          = require('../../../config'),
        path            = require('path'),
        randomValue     = require('../utils').randomValue,
        appRoot         = path.resolve(__dirname, '../../..'),
        adminViews      = path.resolve(appRoot, 'core/server/views'),
        themesRoot      = path.resolve(appRoot, 'content/themes'),
        dataRoot        = path.resolve(appRoot, 'content/data'),
        clientRoot      = path.resolve(appRoot, 'core/client'),
        sharedRoot      = path.resolve(appRoot, 'content/shared'),
        coreShared      = path.resolve(appRoot, 'core/shared');

    function init () {

        // Make sure NODE_ENV is always setup as it is used by express
        var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

        // Set user environment as the first configuration component
        // and memory configuration to be updated during runtime
        cfg.env({ separator: '___' }).add('memory');

        // Use the current environment corresponding configuration
        if (config[env]) {
            cfg.add('userconf', { type:'literal', store:config[env] });
        }

        // Defauls not provided by previous configuration components
        cfg.defaults( require('./defaults') );

        updateFlags();
        updatePaths();
        updateThemePaths();
        generateSecrets();

        return when.resolve();
    }

    function updatePaths () {
        cfg.set('paths:data', dataRoot);
        cfg.set('paths:themes', themesRoot);
        cfg.set('paths:adminViews', adminViews);
        cfg.set('paths:sharedStatic', sharedRoot);
        cfg.set('paths:clientStatic', clientRoot);
        cfg.set('paths:coreShared', coreShared);
    }

    function updateThemePaths () {
        var themeName = cfg.get('theme:name');

        cfg.set('theme:paths:views', path.resolve(themesRoot, themeName));
        cfg.set('theme:paths:static', path.resolve(themesRoot, themeName, 'assets'));
    }

    function updateFlags () {
        var env = process.env.NODE_ENV;

        cfg.set('env', env);
        cfg.set('development', 'development' === env);
        cfg.set('production', 'production' === env);
    }

    function generateSecrets () {
        if (cfg.get('development')) {
            cfg.set('hash', randomValue(6));
        }

        cfg.set('sessionSecret', randomValue(32));
    }

    function setTheme (name) {
        cfg.set('theme:name', name);
        updateThemePaths();
    }

    module.exports.init = init;
    module.exports.setTheme = setTheme;

}());