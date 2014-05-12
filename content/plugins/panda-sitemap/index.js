(function () {
    "use strict";

    var when        = require('when'),
        provider    = require('../../../core/server/providers').postsProvider;

    module.exports = {
        request: function (req, res) {
            return when.try(function () {
                if (req.url === '/foobar.xml') {
                    res.send('Ale fajnie .....');
                }
            });
        }
    };

    require('pkginfo')(module, 'code', 'name', 'description', 'version', 'author');

}());