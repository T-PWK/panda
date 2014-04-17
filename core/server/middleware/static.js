(function () {
    'use strict';

    var cfg         = require('nconf'),
        serveStatic = require('serve-static'),
        handler;

    updateThemeAssets();

    cfg.on('set:theme:paths:static', updateThemeAssets);

    function staticContent(req, res, fn) {
        return handler(req, res, fn);
    }

    function updateThemeAssets() {
        handler = serveStatic(cfg.get('theme:paths:static'), { maxAge: cfg.get('app:staticCacheAge') });
    }

    module.exports = staticContent;
}());