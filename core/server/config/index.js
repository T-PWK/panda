var when        = require('when'),
    cfg         = require('nconf'),
    config      = require('../../../config'),
    path        = require('path'),
    appRoot     = path.resolve(__dirname, '../../..'),
    themesRoot  = path.resolve(appRoot, 'content/themes');

function init () {

    // Make sure NODE_ENV is always setup as it is used by express
    var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
        defaultTheme = 'casper';

    cfg.env({ separator: '___' }).add('memory');

    if (config[env]) {
        cfg.add('userconf', { type: 'literal', store: config[env] });
    }

    cfg.defaults({
        theme: {
            name: 'casper', 
            viewsPath: path.join(themesRoot, 'casper'),
            staticPath: path.join(themesRoot, defaultTheme, 'assets')
        },
        url: 'http://127.0.0.1',
        server: { host: '127.0.0.1', port: 3000 },
        database: { type: 'memory' }
    });

    cfg.set('env', env);
    cfg.set('is:development', 'development' === env);
    cfg.set('is:production', 'production' === env);

    return when();
}

module.exports.init = init;