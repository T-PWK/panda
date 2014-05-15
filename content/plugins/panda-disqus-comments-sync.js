(function () {
    "use strict";

    var cfg         = require('nconf'),
        when        = require('when'),
        node        = require('when/node'),
        moment      = require('moment'),
        _           = require('lodash'),
        request     = require('request'),
        url         = require('url'),
        format      = require('util').format,
        CronJob     = require('cron').CronJob,
        get         = node.lift(request),
        helper      = require('../../core/server/helpers/templatehelper'),
        provider    = require('../../core/server/providers').postsProvider,
        job, apiKey, forum;

    module.exports = {
        code: "disqus-comments-synch",

        name: "Disqus Comments for Panda",

        description: "<p>The Disqus Comments for Panda plugin seamlessly integrates using the Disqus API and by syncing with Panda comments.</p>",

        configuration: "<p>The Disqus Comments for Panda plugin uses following configuration properties under " +
            "<code>plugins:disqus-comments-synch</code> configuration element:</p><ul>" +
            "<li><code>cron</code> - the time to fire off your job. " +
            "The time needs to be in the form of <a href=\"http://crontab.org/\" target=\"_blank\">cron syntax</a>.</li>" +
            "<li><code>forum</code> - Disqus forum name (aka short name).</li>" +
            "<li><code>apiKey</code> - Disqus API key. " +
            "The key can be teken from Disqus <a href=\"https://disqus.com/api/applications/\" target=\"_blank\">applications</a>.</li>" +
            "</ul>",

        author: {
            name: "Panda Team",
            url: "https://github.com/T-PWK/panda"
        },

        start: function () {
            var config = cfg.get('plugins:disqus-comments-synch');

            if (!config || !config.cron || !config.forum || !config.apiKey) {
                this.status = 'W';
                this.messages = [
                    {msg: "Plugin could not start up properly due to missing configuration."}
                ];
            } else {
                forum = config.forum;
                apiKey = config.apiKey;
                job = new CronJob(config.cron, synchronize.bind(this, this), null, true);
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
        var info = {
            start: process.hrtime(),
            timeSpan: null,
            posts: 0,
            updates: 0
        };

        var time = process.hrtime();

        when
            .resolve(provider.findAll({ live: true }))
            .tap(function (posts) {
                info.posts = posts.length;
            })
            .then(function (posts) {

                return when.map(posts, function (post) {
                    return get({
                        uri: "https://disqus.com/api/3.0/threads/details.json",
                        qs: {
                            api_key: apiKey,
                            forum: forum,
                            "thread:link": helper.postUrl(null, post, true)
                        }
                    }).spread(function (res, body) {
                        return JSON.parse(body);
                    }).then(function (obj) {
                        if (obj.code === 0) {
                            info.updates++;
                            return provider.updateProperties(post.id, {commentsCount: obj.response.posts || 0});
                        }
                    });
                });

            })
            .then(updateMessages)
            .otherwise(function (err) {
                console.error(" error ", err)
            });

        function updateMessages () {
            info.timeSpan = process.hrtime(time);

            (plugin.messages || (plugin.messages = [])).push({
                type: 'success',
                msg: format(
                    "Synchronization detail: <dl class=\"dl-horizontal\">" +
                        "<dt>competion time</dt><dd>%s</dd>" +
                        "<dt>time span</dt><dd>%d.%ds</dd>" +
                        "<dt>processed posts</dt><dd>%d</dd>" +
                        "<dt>updated posts</dt><dd>%d</dd></dl>",
                    moment().format('llll'), info.timeSpan[0], Math.ceil(info.timeSpan[1]/1000000), info.posts, info.updates
                )
            });
            plugin.messages = _.last(plugin.messages, 5);
        }
    }

}());