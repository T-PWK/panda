(function () {
    "use strict";

    var cfg     = require('nconf'),
        when    = require('when'),
        moment  = require('moment'),
        _       = require('lodash'),
        format  = require('util').format,
        CronJob = require('cron').CronJob,
        job;

    module.exports = {
        code: "disqus-comments-synch",

        name: "Disqus Comments for Panda",

        description: "<p>The Disqus Comments for Panda plugin seamlessly integrates using the Disqus API and by syncing with Panda comments.</p>",

        configuration: "<p>The Disqus Comments for Panda plugin uses following configuration properties under " +
            "<code>plugins:disqus-comments-synch</code> configuration element:</p><ul>" +
            "<li><code>cron</code> - the time to fire off your job. " +
            "The time needs to be in the form of <a href=\"http://crontab.org/\" target=\"_blank\">cron syntax</a>.</li>" +
            "<li><code>accessToken</code> - Disqus API access token. " +
            "The token can be teken from Disqus <a href=\"https://disqus.com/api/applications/\" target=\"_blank\">applications</a>.</li>" +
            "</ul>",

        author: {
            name: "Panda Team",
            url: "https://github.com/T-PWK/panda"
        },

        start: function () {
            var cron = cfg.get('plugins:disqus-comments-synch:cron');
            if (!cron) {
                this.status = 'W';
                this.messages = [
                    {msg: "Plugin could not start up properly due to missing configuration."}
                ];
            } else {
                job = new CronJob(cron, synchronize.bind(this, this), null, true);
            }
        },

        stop: function () {
            if (job) {
                job.stop();
            }
        }
    };

    require('pkginfo')(module, 'version');

    function synchronize(plugin) {
        var time = process.hrtime();

        when.try(function () {
            console.log('Performing synchronization ...');
        }).delay(5000).then(function () {
            time = process.hrtime(time);

            (plugin.messages || (plugin.messages = [])).push({
                type: 'success',
                msg: format("Synchronization completed at %s. It took %d.%ds",
                    moment().format('llll'), time[0], Math.ceil(time[1]/1000000))
            });
            plugin.messages = _.last(plugin.messages, 5);

        }).otherwise(function (e) {
            console.error(e)
        });
    }

}());