var cfg = require('nconf');

module.exports = 'memory' === cfg.get('database:type') ? require('./userprovider-memory') 
    : require('./userprovider-mongo');