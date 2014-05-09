(function () {
    "use strict";

    var cfg     = require('nconf'),
        when    = require('when'),
        _       = require('lodash'),
        tpl,
        source  = "<script type=\"text/javascript\">" +
            "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){" +
            "(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o)," +
            "m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)" +
            "})(window,document,'script','//www.google-analytics.com/analytics.js','ga');" +
            "ga('create', '${ua}', '${domain}');" +
            "ga('require', 'displayfeatures');" +
            "ga('send', 'pageview');" +
            "$('#drawer-button').on('click', function(){ ga('send', 'event', 'button', 'click', 'Drawer'); });" +
            "</script>";

    module.exports = {
        name: "Google Analytics Plugin",

        description: "Generates Google Analytics web tracking code in a page.<br>" +
            "The plugin requires following properties under <code>theme:custom:ga</code> configuration key:" +
            "<ul><li><strong>ua</strong> - Google Analytics user account number (format: UA-XXXXXXXX-Y)</li>" +
            "<li><strong>domain</strong> - website domain name e.g. mydomain.com</li></ul>" +
            "More information on setting up Google Analytics web tracking code can be found " +
            "<a href=\"https://support.google.com/analytics/answer/1008080\" target=\"_blank\">here</a>.",

        author: {
            name: "Panda Team",
            url: "https://github.com/T-PWK/panda"
        },

        start: function () {
            return when.try(function () { tpl = _.template(source); });
        },

        stop: function () {
            tpl = null;
        },

        footerHook: function (req, res) {
            var data = cfg.get('theme:custom:ga');
            return (!data || !data.ua || !data.domain) ? '' : tpl(data);
        }
    };

    require('pkginfo')(module, 'version');

}());