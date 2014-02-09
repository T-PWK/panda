var when            = require('when'),
    cfg             = require('nconf'),
    config          = require('../../../config'),
    path            = require('path'),
    appRoot         = path.resolve(__dirname, '../../..'),
    themesRoot      = path.resolve(appRoot, 'content/themes');

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

    // console.info(require('util').inspect(cfg, {depth: 5}))

    return when();
}

function updatePaths () {
    var themeName = cfg.get('theme:name');

    cfg.set('theme:viewsPath', path.resolve(themesRoot, themeName));
    cfg.set('theme:staticPath', path.resolve(themesRoot, themeName, 'assets'));
}

function updateFlags () {
    var env = process.env.NODE_ENV;

    cfg.set('env', env);
    cfg.set('development', 'development' === env);
    cfg.set('production', 'production' === env);
}

module.exports.init = init;