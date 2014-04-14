(function () {
    "use strict";

    var cfg = require('nconf'),
        _   = require('lodash');

    module.exports.adminIpCheck = function (req, res, fn) {
        var ips = cfg.get('admin:allowedIps'),
            ip  = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        if (cfg.get('admin:restrictByIp') === false || _.isEmpty(ips)) {
            return fn();
        }

        if (_.indexOf(ips, ip, true) === -1) {
            res.send(403);
        } else {
            fn();
        }
    };

    module.exports.siteIpCheck = function (req, res, fn) {
        if (cfg.get('app:restrictByIp') === false) {
            return fn();
        }

        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        if (_.indexOf(cfg.get('app:disallowedIps'), ip, true) > -1) {
            res.send(403);
        } else {
            fn();
        }
    };

}());