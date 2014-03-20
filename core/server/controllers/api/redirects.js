var provider = require('../../providers').configProvider;

module.exports.index = function (req, res) {
    provider
        .findAllRedirects()
        .done(
            res.json.bind(res),
            res.send.bind(res, 500)
        );
};

module.exports.show = function (req, res) {
    provider
        .findRedirectById(req.params.redirect)
        .done(
            res.json.bind(res),
            res.send.bind(res, 500)
        );
};

module.exports.update = function (req, res) {
    provider
        .updateRedirect(req.params.redirect, req.body)
        .done(
            res.send.bind(res, 200),
            res.send.bind(res, 500)
        );
};

module.exports.destroy = function (req, res) {
    provider
        .deleteRedirect(req.params.redirect)
        .done(
            res.json.bind(res),
            res.send.bind(res, 500)
        );
};

module.exports.create = function (req, res) {
    console.info('creating redirect ...', req.body)
    provider
        .createRedirect(req.body)
        .done(
            res.json.bind(res),
            res.send.bind(res, 500)
        );
};