(function () {
    'use strict';

    var when            = require('when'),
        themesProvider  = require('../../providers').themesProvider;


    module.exports.index = function (req, res) {
        when.resolve(themesProvider.getThemes())
            .then(res.json.bind(res))
            .otherwise(res.send.bind(res, 500));
    };

    module.exports.update = function (req, res) {
        when.resolve(themesProvider.updateTheme(req.params.id))
            .done(
                res.json.bind(res),
                res.send.bind(res, 400)
            );
    };

}());