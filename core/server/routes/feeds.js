(function () {
    'use strict';

    var ips         = require('./../middleware/ips'),
        robots      = require('../controllers/robots');

    module.exports = function (app) {
        app.get('/robots.txt', ips.siteIpCheck, robots);
    };

})();
