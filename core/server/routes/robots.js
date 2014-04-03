(function () {
    'use strict';

    var robots = require('../controllers/robots');

    module.exports = function (server) {
        server.get('/robots.txt', robots);
    };

})();
