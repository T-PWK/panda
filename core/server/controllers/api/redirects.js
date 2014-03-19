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

module.exports.destroy = function (req, res) {
    provider
        .deleteRedirect(req.params.redirect)
        .done(
            res.json.bind(res),
            res.send.bind(res, 500)
        );
};