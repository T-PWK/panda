(function () {
    "use strict";

    var cfg     = require('nconf'),
        _       = require('lodash');

    module.exports.adminIpCheck = function (req, res, fn) {
        check('admin:restrictByIp', 'admin:disallowedIps', req, res, fn);
    };

    module.exports.siteIpCheck = function (req, res, fn) {
        check('app:restrictByIp', 'app:disallowedIps', req, res, fn);
    };

    function check(checkId, arrayId, req, res, fn) {
        if (cfg.get(checkId) === false) {
            return fn();
        }
        _.indexOf(cfg.get(arrayId), req.ip, true) > -1 ? res.send(403) : fn();
    }

}());