var when            = require('when'),
    cfg             = require('nconf'),
    config          = require('../../../config'),
    path            = require('path'),
    appRoot         = path.resolve(__dirname, '../../..'),
    adminViews      = path.resolve(appRoot, 'core/server/views'),
    themesRoot      = path.resolve(appRoot, 'content/themes'),
    dataRoot        = path.resolve(appRoot, 'content/data'),
    sharedRoot      = path.resolve(appRoot, 'content/shared');

function init () {

    // Make sure NODE_ENV is always setup as it is used by express
    var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

    // Set user environment as the first configuration component 
    // and memory configuration to be updated during runtime
    cfg
        .env({ separator: '___' })
        .add('memory');

    // Use the current environment corresponding configuration
    if (config[env]) {
        cfg.add('userconf', { type:'literal', store:config[env] });
    }

    // Defauls not provided by previous configuration components
    cfg.defaults( require('./defaults') );

    updateFlags();
    updatePaths();
    updateThemePaths();

    // console.info(require('util').inspect(cfg, {depth: 5}))

    return when();
}

function updatePaths () {
    cfg.set('paths:data', dataRoot);
    cfg.set('paths:themes', themesRoot);
    cfg.set('paths:adminViews', adminViews);
    cfg.set('paths:sharedStatic', sharedRoot);
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

module.exports.init = init;