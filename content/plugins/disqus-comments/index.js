(function () {
    "use strict";

    var when = require('when'),
        CronJob = require('cron').CronJob,
        job;

    module.exports = {
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
                .delay(1000);
        }
    };

    require('pkginfo')(module, ['version', 'description', 'name', 'author', 'code']);

    function synchronize() {
        console.log('Performing synchronization ...');
    }

}());