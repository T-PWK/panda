var when    = require('when'),
    cfg     = require('nconf');

function init () {
    //console.info(cfg.get([cfg.get('NODE_ENV'), 'database:type'].join(':')))
    // TODO: poroviders initialization ...
    return when();
}

module.exports.init = init;