(function () {
    "use strict";

    var MobileDetect = require('mobile-detect');

    module.exports = function (req, res, fn) {
        res.locals.md = new MobileDetect(req.headers['user-agent']);
        fn();
    };

}());