(function () {
    'use strict';

    var when        = require('when'),
        provider    = require('../../providers').redirectsProvider;

    module.exports.index = function (req, res) {
        when.resolve(
            provider.findAllRedirects({select: 'from to type'})
        ).done(
            res.json.bind(res),
            res.send.bind(res, 500)
        );
    };

    module.exports.show = function (req, res) {
        when.resolve(provider.findRedirectById(req.params.id))
            .done(
                res.json.bind(res),
                res.send.bind(res, 500)
            );
    };

    module.exports.update = function (req, res) {
        when.resolve(provider.updateRedirect(req.params.id, req.body))
            .done(
                res.send.bind(res, 200),
                res.send.bind(res, 500)
            );
    };

    module.exports.destroy = function (req, res) {
        when.resolve(provider.deleteRedirect(req.params.id))
            .done(
                res.json.bind(res),
                res.send.bind(res, 500)
            );
    };

    module.exports.create = function (req, res) {
        when.resolve(provider.createRedirect(req.body))
            .done(
                res.json.bind(res),
                res.send.bind(res, 500)
            );
    };

})();