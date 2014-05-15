(function () {
    "use strict";

    var when        = require('when'),
        node        = require('when/node'),
        _           = require('lodash'),
        multiparty  = require('multiparty'),
        provider    = require('../../providers').imageProvider;

    module.exports = function (req, res) {
        var form = new multiparty.Form(), parse = node.lift(form.parse.bind(form));

        parse(req)
            .spread(function (fields, files) {
                return _.map(files.file, provider.createFromFile.bind(provider));
            })
            .then(when.all)
            .done(res.send.bind(res, 200), res.send.bind(res, 500));
    };

}());