var when    = require('when'),
    cfg     = require('nconf'),
    config  = require('../../../config'),
    path    = require('path').join;

function init () {

    // Make sure NODE_ENV is always setup as it is used by express
    var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
        defaultTheme = 'casper'
        basePath = path(__dirname, '../../..'),
        themeBasePath = path(basePath, 'content/themes');

    cfg.env({ separator: '___' }).add('memory');

    if (config[env]) {
        cfg.add('userconf', { type: 'literal', store: config[env] });
    }

    cfg.defaults({
        theme: {
            name: 'casper', 
            viewPath: path(themeBasePath, 'casper'),
            staticPath: path(themeBasePath, defaultTheme, 'assets')
        },
        url: 'http://127.0.0.1',
        server: { host: '127.0.0.1', port: 3000 },
        database: { type: 'memory' }
    });

    cfg.set('env', env);
    cfg.set('is:development', 'development' === env);
    cfg.set('is:production', 'production' === env);

    // console.log(require('util').inspect(cfg, {depth: 5}))

    return when();
}

module.exports.init = init;