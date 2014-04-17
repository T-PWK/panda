(function () {
    'use strict';

    require('pkginfo')(module, 'version');

    module.exports = function poweredBy (req, res, next) {
        res.setHeader('X-Powered-By', 'Panda v' + exports.version);
        next();
    };

})();