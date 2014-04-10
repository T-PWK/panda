(function () {
    "use strict";

    var cfg     = require('nconf'),
        _       = require('lodash'),
        when    = require('when'),
        provider  = require('../../providers').configProvider;

    module.exports.index = function (req, res) {
        var type = req.params.type, enabledKey, ipsKey;

        switch (type) {
            case 'admin':
                enabledKey = 'admin:restrictByIp';
                ipsKey = 'admin:allowedIps';
                break;
            case 'site':
                enabledKey = 'app:restrictByIp';
                ipsKey = 'app:disallowedIps';
                break;
            default : return res.send(404);
        }

        return res.json({ type: type, enabled: cfg.get(enabledKey), ips: cfg.get(ipsKey), currentIp: req.ip });
    };

    module.exports.create = function (req, res) {
        var type = req.params.type, enabledKey, ipsKey, update = req.body, promises = [];

        switch (type) {
            case 'admin':
                enabledKey = 'admin:restrictByIp';
                ipsKey = 'admin:allowedIps';
                break;
            case 'site':
                enabledKey = 'app:restrictByIp';
                ipsKey = 'app:disallowedIps';
                break;
            default : return res.send(404);
        }

        if (!_.isUndefined(update.enabled) && update.enabled !== cfg.get(enabledKey)) {
            update.enabled = !!update.enabled;
            promises.push(persistChange(enabledKey, update.enabled));
        }

        if (!_.isUndefined(update.ips) && _.isArray(update.ips)) {

            switch (req.query.op) {
                case 'add': update.ips = _.union(cfg.get(ipsKey), update.ips); break;
                case 'remove': update.ips = _.difference(cfg.get(ipsKey), update.ips); break;
            }

            if (!_.isEqual(update.ips, cfg.get(ipsKey))) {
                update.ips = _.chain(update.ips).compact().sortBy().unique(true).value();
                promises.push(persistChange(ipsKey, update.ips));
            }
        }

        when.all(promises)
            .then(module.exports.index.bind(null, req, res))
            .otherwise(res.send.bind(res, 404));
    };

    function persistChange(key, value) {
        return provider.saveConfig(key, value)
            .then(function () {
                cfg.set(key, value);
                cfg.notify('set:' + key, value);
            });
    }

}());