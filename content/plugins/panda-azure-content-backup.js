(function () {
    "use strict";

    var cfg             = require('nconf'),
        azure           = require('azure'),
        when            = require('when'),
        node            = require('when/node'),
        sequence        = require('when/sequence'),
        moment          = require('moment'),
        debug           = require('debug')('panda:plugins:panda-azure-content-backup'),
        stringify       = when.lift(JSON.stringify),
        format          = require('util').format,
        _               = require('lodash'),
        providers       = require('../../core/server/providers'),
        CronJob         = require('cron').CronJob,
        job, blob, createBlockBlobFromText, container;

    module.exports = {
        code: "panda-azure-content-backup",

        name: "Content Backup to Azure for Panda",

        description: "<p>The Content Backup to Azure for Panda plugin will back up your database content to Windows Azure Blob on a schedule that suits you.</p>",

        configuration2: "<p>The Disqus Comments for Panda plugin uses following configuration properties under " +
            "<code>plugins:panda-azure-content-backup</code> configuration element:</p><ul>" +
            "<li><code>cron</code> - the time to fire off your job. " +
            "The time needs to be in the form of <a href=\"http://crontab.org/\" target=\"_blank\">cron syntax</a>.</li>" +
            "<li><code>account</code> - </li>" +
            "<li><code>key</code> - </li>" +
            "<li><code>container</code> - </li>" +
            "</ul>",

        author: {
            name: "Panda Team",
            url: "https://github.com/T-PWK/panda"
        },

        configuration: function () {
            var config = cfg.get('plugins:panda-azure-content-backup') || {};

            return [
                { id:"cron", name: "Cron", type:"text", value:config.cron, key:'cron' },
                { id:"account", name: "Account", type:"text", help:"Windows Azure Blob account name", value:config.account, key:'account' },
                { id:"key", name: "Key", type:"text", help:"Windows Azure Blob account access key", value:config.key },
                { id:"container", name: "Container", type:"text", help:"Windows Azure Blob container name where backup files will be stored", value:config.container }
            ];
        },

        start: function () {
            debug('starting');

            var config = cfg.get('plugins:panda-azure-content-backup');

            if (!config || !config.cron || !config.account || !config.key || !config.container) {
                this.status = 'W';
                this.messages.push({msg: "Plugin could not start up properly due to missing configuration."});

                debug('start-up failed due to missing configuration');

                return when.reject();
            }

            blob = azure.createBlobService(config.account, config.key);
            createBlockBlobFromText = node.lift(blob.createBlockBlobFromText.bind(blob));
            container = config.container;

            job = new CronJob(config.cron, backup.bind(this, this), null, true);
        },

        stop: function () {
            debug('stopping');

            if (job) {
                job.stop();
            }

            blob = null;
            container = null;
            createBlockBlobFromText = null;
        }
    };

    require('pkginfo')(module, 'version');

    function createBlob(post, dir, subdir, stats) {

        return stringify(post)
            .then(function (data) {
                return createBlockBlobFromText(
                    container, format('%s/%s/%s.json', dir, subdir, post.id), data, { contentType: 'application/json'}
                );
            })
            .tap(function () {
                stats.count++;
            });
    }

    function convertToTask (items) {
        return items.map(function (item) {
            return createBlob.bind(null, item);
        });
    }

    function backup(plugin) {
        debug('starting backup');

        var time    = process.hrtime(),
            dir     = moment().format('YYYY-MM-DDTHH-mm-ss'),
            stats   = {
                startTime: process.hrtime(),
                users: { count: 0 },
                posts: { count: 0 },
                configs: { count: 0 },
                redirects: { count: 0 }
            };

        when
            .resolve(providers.postsProvider.findAll())                                     // fetch all posts
            .then(convertToTask)
            .then(function (tasks) {
                debug('saving posts');
                return sequence(tasks, dir, 'posts', stats.posts);                          // Store all posts
            })
            .then(providers.configProvider.findAllConfigs.bind(providers.configProvider))
            .then(convertToTask)
            .then(function (tasks) {
                debug('saving configs');
                return sequence(tasks, dir, 'configs', stats.configs);                      // Store all configurations
            })
            .then(providers.redirectsProvider.findAllRedirects.bind(providers.redirectsProvider))
            .then(convertToTask)
            .then(function (tasks) {
                debug('saving redirects');
                return sequence(tasks, dir, 'redirects', stats.redirects);                  // Store all redirects
            })
            .then(providers.usersProvider.findAllUsers.bind(providers.usersProvider))
            .then(convertToTask)
            .then(function (tasks) {
                debug('saving users');
                return sequence(tasks, dir, 'users', stats.users);                          // Store all users
            })
            .done(success, failure);

        function success () {
            stats.timeSpan = process.hrtime(stats.startTime);

            plugin.messages.push({
                type: 'success',
                msg: "Export details:",
                properties: [
                    { name: "Completion time", value: moment().format('llll') },
                    { name: "Time span", value: format("%d.%ds", stats.timeSpan[0], Math.ceil(stats.timeSpan[1] / 1000000)) },
                    { name: "Export directory", value: dir },
                    { name: "Exported posts", value: stats.posts.count },
                    { name: "Exported users", value: stats.users.count },
                    { name: "Exported configs", value: stats.configs.count },
                    { name: "Exported redirects", value: stats.redirects.count }
                ]
            });
            plugin.messages = _.last(plugin.messages, 5);
        }

        function failure (error) {
            plugin.messages.push({
                type: 'danger',
                msg: format('Export failed at %s due to following error: %s', moment().format('llll'), error)
            });
            plugin.messages = _.last(plugin.messages, 5);
        }
    }

}());