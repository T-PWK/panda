(function () {
    "use strict";

    var cfg     = require('nconf'),
        _       = require('lodash');

    module.exports.adminIpCheck = function (req, res, fn) {
        var ips = cfg.get('admin:allowedIps');

        if (cfg.get('admin:restrictByIp') === false || _.isEmpty(ips)) {
            return fn();
        }

        _.indexOf(ips, req.ip, true) === -1 ? res.send(403) : fn();
    };

    module.exports.siteIpCheck = function (req, res, fn) {
        if (cfg.get('app:restrictByIp') === false) {
            return fn();
        }
        _.indexOf(cfg.get('app:disallowedIps'), req.ip, true) > -1 ? res.send(403) : fn();
    };

}());