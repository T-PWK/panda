(function () {
    "use strict";

    var cfg         = require('nconf'),
        when        = require('when'),
        node        = require('when/node'),
        fs          = require('fs'),
        readFile    = node.lift(fs.readFile),
        _           = require('lodash'),
        embedTpl, countTpl;

    module.exports = {

        start: function () {

            if (!cfg.get('theme:custom:disqus:shortname')) {
                this.status = "W";
                this.messages = [
                    {msg: "Plugin could not start up properly due to missing configuration."}
                ];

                return;
            }

            return when
                .all([
                    readFile(__dirname + '/embed.txt'),
                    readFile(__dirname + '/count.txt')
                ]).spread(function (embed, count) {
                    embedTpl = _.template(embed);
                    countTpl = _.template(count);
                });
        },

        stop: function () {
            embedTpl = countTpl = null;
        },

        pageFooter: function (req, res) {
            var name = cfg.get('theme:custom:disqus:shortname'),
                data = { shortname: name },
                code = [];

            if (!name) { return; }

            if (res.locals.post) { code.push(embedTpl(data)); }
            code.push(countTpl(data));

            return code.join('');
        }
    };

    require('pkginfo')(module, ['version', 'code', 'description', 'configuration', 'name']);

}());