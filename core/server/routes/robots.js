(function () {
    'use strict';

    var express     = require('express'),
        ips         = require('./../middleware/ips'),
        robots      = require('../controllers/robots');

    module.exports = function (app) {
        app.use("/robots.txt", express.Router().use(ips.siteIpCheck).get('/', robots));
    };

})();
