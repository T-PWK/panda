var cfg = require('nconf');

module.exports = 'memory' === cfg.get('database:type') ? require('./postprovider-memory') 
    : require('./postprovider-mongo');