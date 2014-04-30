(function () {
    "use strict";

    var provider = require('../../providers').imageProvider;

    module.exports.index = function (req, res) {
        provider.all()
            .then(function (images) {
                res.json(images);
            }).otherwise(function (err) {
                console.error(err)
                res.json([])
            });
    };

//    module.exports.index = function (req, res) {
//        var listContainers = node.lift(blob.listContainers.bind(blob));
//
//        listContainers().spread(function (containers) {
//            console.info('containers ....', containers)
//            return containers.map(function (info) {
//                return info.name;
//            })
//        }).then(function (val) {
//            console.log(val)
//            res.json([])
//        });
//    }

}());