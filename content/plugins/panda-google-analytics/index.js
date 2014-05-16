(function () {
    "use strict";

    var cfg         = require('nconf'),
        when        = require('when'),
        fs          = require('fs'),
        node        = require('when/node'),
        readFile    = node.lift(fs.readFile),
        _           = require('lodash'),
        tpl;

    module.exports = {

        start: function () {

            var data = cfg.get('plugins:panda-google-analytics');

            if (!data || !data.ua || !data.domain) {
                this.status = 'W';
                this.messages.push({ msg: "Plugin could not start up properly due to missing configuration." });

                return when.reject();
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
            return tpl(cfg.get('plugins:panda-google-analytics'));
        }
    };

    require('pkginfo')(module, ['version', 'name', 'code', 'description', 'configuration', 'author']);

}());