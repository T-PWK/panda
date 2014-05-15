(function () {
    "use strict";

    var cfg         = require('nconf'),
        fs          = require('fs'),
        node        = require('when/node'),
        readFile    = node.lift(fs.readFile),
        _           = require('lodash'),
        tpl, source;

    module.exports = {

        start: function () {

            var data = cfg.get('theme:custom:ga');

            if (!data || !data.ua || !data.domain) {
                this.status = 'W';
                this.messages = [
                    { msg: "Plugin could not start up properly due to missing configuration." }
                ];

                return;
            }

            return readFile(__dirname + '/code.txt')
                .then(function (src) {
                    tpl = _.template(src);
                });
        },

        stop: function () {
            tpl = null;
        },

        pageFooter: function () {
            var data = cfg.get('theme:custom:ga');
            return (!data || !data.ua || !data.domain) ? '' : tpl(data);
        }
    };

    require('pkginfo')(module, ['version', 'name', 'code', 'description', 'configuration', 'author']);

}());