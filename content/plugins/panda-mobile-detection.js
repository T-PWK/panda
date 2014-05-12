(function () {
    "use strict";

    var when            = require('when'),
        MobileDetect    = require('mobile-detect');

    module.exports = {
        code: 'panda-mobile-detection',

        name: "Mobile Detection Plugin",

        description: "<p>Instantiates mobile detection object and assigns it to the <code>md</code> template variable.</p>" +
            "<p>Mobile detection uses <a href=\"https://www.npmjs.org/package/mobile-detect\" target=\"_blank\">mobile-detect</a> npm module.</p>",

        author: {
            name: "Panda Team",
            url: "https://github.com/T-PWK/panda"
        },

        post: function (req, res) {
            return when.try(updateLocals.bind(null, req, res));
        },

        posts: function (req, res) {
            return when.try(updateLocals.bind(null, req, res));
        }
    };

    function updateLocals (req, res) {
        res.locals.md = new MobileDetect(req.headers['user-agent']);
    }

    require('pkginfo')(module, 'version');

}());