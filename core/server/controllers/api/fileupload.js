(function () {
    "use strict";

    var multiparty  = require('multiparty'),
        provider    = require('../../providers').imageProvider;

    module.exports = function (req, res) {
        console.info('file upload request ...')

        var form = new multiparty.Form();

        form.on('part', function(part){
            if (!part.filename) return;

            var size = part.byteCount - part.byteOffset,
                name = part.filename;

            console.info('Uploading file to azure blob : ', name, size);

            provider.createFromStream(name, size, part);
        });


        form.parse(req);
        res.send('File uploaded successfully');
//
//        form.parse(req, function (err, fields, files) {
//            console.info(require('util').inspect({fields: fields, files: files}, {depth: 5}));
//            res.send(200);
//        });
    };

}());