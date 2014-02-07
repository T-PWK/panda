var when    = require('when'),
    cfg     = require('nconf'),
    config  = require('../../../config');

function init () {
    cfg
        .env({ separator: '__' })
        .add('memory')
        .add('userconf', { type: 'literal', store: config })
        .defaults({
            NODE_ENV: 'development',
            PORT: 3000
        });

    var env = cfg.get('NODE_ENV');

    cfg.set('env', env);
    cfg.set('is:development', 'development' === env);
    cfg.set('is:production', 'production' === env);

    // Make sure NODE_ENV is always setup as it is used by express
    process.env.NODE_ENV = env;

    return when();
}

module.exports.init = init;