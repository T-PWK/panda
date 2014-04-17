(function () {
    'use strict';

    var redirectCtrl = require('../controllers/redirects');

    module.exports = function (server) {
        server.get('*', redirectCtrl);
    };

})();
