var configProvider  = require('../providers').configProvider;

module.exports = function (server) {
    server.get(/^\/(?!assets\/).*/, function (req, res, next) {
        configProvider
            .findRedirectByUrl(req.path)
            .then(function (redirect) {
                if (redirect) {
                    res.redirect(redirect.to, redirect.permanent ? 301 : 302);
                } else {
                    next('route')
                }
            });
    })
}