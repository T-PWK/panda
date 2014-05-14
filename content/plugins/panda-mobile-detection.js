(function () {
    "use strict";

    var when            = require('when'),
        MobileDetect    = require('mobile-detect');

    module.exports = {
        code: 'panda-mobile-detection',

        name: "Mobile Detection for Panda",

        description: "<p>The Mobile Detection for Panda plugin automatically detects if the visitor is using a standard mobile phone or a smart phone.</p>" +
            "<p>It allows Panda themes to present different content based on the device or manufacturer type.</p>" +
            "<hr><p>This plugin instantiates mobile detection object and assigns it to the <code>md</code> template variable. Mobile detection instance can be used in a theme to present different content based on the detected device type.</p>" +
            "<p>The Mobile Detection for Panda plugin uses <a href=\"https://www.npmjs.org/package/mobile-detect\" target=\"_blank\">mobile-detect</a> npm module.</p>",

        author: {
            name: "Panda Team",
            url: "https://github.com/T-PWK/panda"
        },

        post: updateLocals,

        posts: updateLocals
    };

    function updateLocals (req, res) {
        res.locals.md = new MobileDetect(req.headers['user-agent']);
    }

    require('pkginfo')(module, 'version');

}());