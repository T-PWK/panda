(function () {
    "use strict";

    var when = require('when'),
        CronJob = require('cron').CronJob,
        job;

    module.exports = {
        code: "disqus-comments-synchronizer",

        name: "Disqus Comments for Panda",

        description: "<p>The Disqus Comments for Panda plugin seamlessly integrates using the Disqus API and by syncing with Panda comments.</p>",

        author: {
            name: "Panda Team",
            url: "https://github.com/T-PWK/panda"
        },

        start: function () {
            return when
                .try(function () {
                    job = new CronJob('*/5 * * * * *', synchronize, null, true);
                })
                .delay(2000);
        },

        stop: function () {
            return when
                .try(function () {
                    job.stop();
                })
                .delay(2000);
        }
    };

    require('pkginfo')(module, ['version', 'description', 'name', 'author', 'code']);

    function synchronize() {
        console.log('Performing synchronization ...');
    }

}());