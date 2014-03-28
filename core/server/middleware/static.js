(function () {
    'use strict';

    var cfg         = require('nconf'),
        staticFn    = require('express')['static'],
        handler;

    updateThemeAssets();

    cfg.on('set:theme:paths:static', updateThemeAssets);

    function staticContent(req, res, fn) {
        return handler(req, res, fn);
    }

    function updateThemeAssets() {
        handler = staticFn(cfg.get('theme:paths:static'), { maxAge: cfg.get('app:staticCacheAge') });
    }

    module.exports = staticContent;
}());