(function () {
    "use strict";

    var cfg         = require('nconf'),
        when        = require('when'),
        node        = require('when/node'),
        fs          = require('fs'),
        debug       = require('debug')('panda:panda-disqus-universal'),
        readFile    = node.lift(fs.readFile),
        _           = require('lodash'),
        embedTpl, countTpl;

    module.exports = {

        start: function () {

            debug('starting');

            if (!cfg.get('plugins:panda-disqus-universal')) {
                this.status = "W";
                this.messages.push({msg: "Plugin could not start up properly due to missing configuration."});

                debug('start-up failed due to missing configuration');

                return when.reject();
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
            debug('stopping');
            embedTpl = countTpl = null;
        },

        pageFooter: function (req, res) {
            var data    = cfg.get('plugins:panda-disqus-universal'),
                output  = [];

            if (res.locals.post) {
                output.push(embedTpl(data));
            }
            output.push(countTpl(data));

            return output.join('');
        }
    };

    require('pkginfo')(module, ['version', 'code', 'description', 'configuration', 'name']);

}());