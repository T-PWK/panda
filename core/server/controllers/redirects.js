var configProvider  = require('../providers').configProvider;

module.exports = function (req, res, next) {
    configProvider
        .findRedirectByUrl(req.path)
        .then(function (redirect) {

            if (!redirect) return next('route');

            var type = redirect.type || 'internal';

            switch(type) {
                case 301:
                case 302: return res.redirect(redirect.to, +type);
                case 'internal': req.url = redirect.to;
                default: next('route');
            }
        });
}
