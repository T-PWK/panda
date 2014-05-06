(function () {
    'use strict';

    var provider = require('../providers').redirectsProvider;

    module.exports = function (req, res, next) {
        provider
            .findRedirectByUrl(req.path)
            .then(function (redirect) {
                if (!redirect) return next('route');

                var type = redirect.type || 'internal';

                switch (type) {
                    case '301':
                    case '302':
                        return res.redirect(redirect.to, +type);
                    case 'internal':
                        req.url = redirect.to;
                }
                next('route');
            });
    };

})();