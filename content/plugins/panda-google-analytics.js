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
        code: 'panda-google-analytics',

        name: "Google Analytics for Panda",

        description: "<p>The Google Analytics for Panda plugin generates Google Analytics web tracking code in a page.</p>" +
            "<p>More information about Google Analytics web tracking code are how to embed it in a page can be found " +
            "<a href=\"https://support.google.com/analytics/answer/1008080\" target=\"_blank\">here</a>.</p>",

        configuration: "<p>This plugin requires the following properties under <code>theme:custom:ga</code> configuration key:</p>" +
            "<ul><li><strong>ua</strong> - Google Analytics user account number (format: UA-XXXXXXXX-Y)</li>" +
            "<li><strong>domain</strong> - website domain name e.g. <em>mydomain.com</em></li></ul>",

        author: {
            name: "Panda Team",
            url: "https://github.com/T-PWK/panda"
        },

        start: function () {
                var data = cfg.get('theme:custom:ga');
                if (!data || !data.ua || !data.domain) {
                    this.status = 'W';
                    this.messages = [
                        {msg: "Plugin could not start up properly due to missing configuration."}
                    ];

                    return;
                }

                tpl = _.template(source);
        },

        stop: function () {
            tpl = null;
        },

        footerHook: function () {
            var data = cfg.get('theme:custom:ga');
            return (!data || !data.ua || !data.domain) ? '' : tpl(data);
        }
    };

    require('pkginfo')(module, 'version');

}());