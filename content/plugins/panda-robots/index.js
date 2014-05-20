(function () {
    'use strict';

    var cfg         = require('nconf'),
        _           = require('lodash'),
        when        = require('when'),
        node        = require('when/node'),
        fs          = require('fs'),
        debug       = require('debug')('panda:plugins:panda-robots'),
        readFile    = node.lift(fs.readFile),
        tpl;

    module.exports = {

        start: function () {
            debug('starting');
            return readFile(__dirname + '/robots.txt').then(function (content) {
                tpl = _.template(content);
            });
        },

        stop: function () {
            debug('stopping');
            tpl = null;
        },

        request: function (req, res) {
            if (req.url !== '/robots.txt') {
                return;
            }

            var data = {
                url: cfg.get('url')
            };

            res.type('text').send(tpl(data));

            return true;
        }
    };

    require('pkginfo')(module, ['version', 'code', 'name', 'description', 'author']);

})();