(function () {
    "use strict";

    var multiparty  = require('multiparty');

    module.exports = function (req, res) {
        var form = new multiparty.Form();

        form.parse(req, function (err, fields, files) {
            console.info(require('util').inspect({fields: fields, files: files}, {depth: 5}));
            res.send(200);
        });
    };

}());