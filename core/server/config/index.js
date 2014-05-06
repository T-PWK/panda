(function () {
    'use strict';

    var when            = require('when'),
        cfg             = require('nconf'),
        _               = require('underscore'),
        moment          = require('moment'),
        path            = require('path'),
        EventEmitter    = require('events').EventEmitter,
        configEmitter   = new EventEmitter(),
        appRoot         = path.resolve(__dirname, '../../..'),
        adminViews      = path.resolve(appRoot, 'core/server/views'),
        themesRoot      = path.resolve(appRoot, 'content/themes'),
        pluginRoot      = path.resolve(appRoot, 'content/plugins'),
        dataRoot        = path.resolve(appRoot, 'content/data'),
        clientRoot      = path.resolve(appRoot, 'core/client'),
        sharedRoot      = path.resolve(appRoot, 'content/shared'),
        coreShared      = path.resolve(appRoot, 'core/shared');

    // EventEmitter functionality added to configuration
    cfg.notify = function() {
        EventEmitter.prototype.emit.apply(
            configEmitter, Array.prototype.slice.call(arguments));
    };

    cfg.on = function(event, listener) {
        configEmitter.on(event, listener);
    };

    cfg.once = function(event, listener) {
        configEmitter.once(event, listener);
    };

    function init () {
        // Make sure NODE_ENV is always setup as it is used by express
        var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

        var config = new cfg.Provider();
        config.file({ file: path.join(__dirname, '../../../config.json') });

        // Set user environment as the first configuration component
        // and memory configuration to be updated during runtime
        cfg.env({ separator: '___' }).add('memory');

        // Use the current environment corresponding configuration
        if (config.get(env)) {
            cfg.add('userconf', { type:'literal', store:config.get(env) });
        }

        // Defauls not provided by previous configuration components
        cfg.defaults( require('./defaults') );

        updateFlags();
        updatePaths();
        updateThemePaths();
        miscTimes();

        // Update site theme paths upon theme:name change
        cfg.on('set:theme:name', updateThemePaths);

        return when.resolve();
    }

    function miscTimes() {
        fromStringToMs('admin:sessionCookieMaxAge');
        fromStringToMs('app:staticCacheAge');
    }

    function updatePaths () {
        cfg.set('paths:data', dataRoot);
        cfg.set('paths:themes', themesRoot);
        cfg.set('paths:plugins', pluginRoot);
        cfg.set('paths:adminViews', adminViews);
        cfg.set('paths:sharedStatic', sharedRoot);
        cfg.set('paths:clientStatic', clientRoot);
        cfg.set('paths:coreShared', coreShared);
    }

    function updateThemePaths () {
        var themeName = cfg.get('theme:name');

        cfg.set('theme:paths:views', path.resolve(themesRoot, themeName));
        cfg.set('theme:paths:static', path.resolve(themesRoot, themeName, 'assets'));

        cfg.notify('set:theme:paths:views');
        cfg.notify('set:theme:paths:static');
    }

    function updateFlags () {
        var env = process.env.NODE_ENV;

        cfg.set('env', env);
        cfg.set('development', 'development' === env);
        cfg.set('production', 'production' === env);
    }

    function fromStringToMs (key) {
        var cfgValue =  cfg.get(key);
        if (_.isString(cfgValue)) {
            cfg.set(key, moment.duration(cfgValue).as('milliseconds'));
        }
    }

    module.exports.init = init;

}());