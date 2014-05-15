(function () {
    "use strict";

    var cfg         = require('nconf'),
        when        = require('when'),
        _           = require('lodash'),

        // Disqus Universal Code to embed forum script
        threadSrc   = "<script type=\"text/javascript\">if(typeof DISQUS !== 'object') {" +
            "(function () { " +
            "var s = document.createElement('script'); s.async = true;" +
            "s.type = 'text/javascript';" +
            "s.src = '//${shortname}.disqus.com/embed.js';" +
            "(document.getElementsByTagName('HEAD')[0] || document.getElementsByTagName('BODY')[0]).appendChild(s); " +
            "}());" +
            "}" +
            "</script>",

        // Disqus Universal Code to embed number of comments count script
        countSrc    = "<script type=\"text/javascript\">" +
            "var disqus_shortname = '${shortname}';" +
            "(function () { var s = document.createElement('script'); s.async = true;" +
            "s.type = 'text/javascript';" +
            "s.src = 'http://' + disqus_shortname + '.disqus.com/count.js';" +
            "(document.getElementsByTagName('HEAD')[0] || document.getElementsByTagName('BODY')[0]).appendChild(s);" +
            "}());" +
            "</script>",

        threadTpl, countTpl;

    module.exports = {
        code: 'panda-disqus-universal',

        name: "Disqus Universal Code for Panda",

        description: "<p>The Disqus Universal Code for Panda plugin embeds JavaScript code which loads Disqus forum as well as number of comments on your site.</p>" +
            "<p>More on Universal Embed Code can be found <a href=\"http://help.disqus.com/customer/portal/articles/472097-universal-embed-code\", target=\"_blank\">here</a>.</p>",

        configuration: "<p>This plugin requires the following properties under <code>theme:custom:disqus</code> configuration element:" +
            "<ul><li><code>shortname</code> - forum short name</li></ul></p>",

        author: {
            name: "Panda Team",
            url: "https://github.com/T-PWK/panda"
        },

        start: function () {
            if (!cfg.get('theme:custom:disqus:shortname')) {
                this.status = "W";
                this.messages.push({msg: "Plugin could not start up properly due to missing configuration."});

                return when.reject();
            }

            threadTpl = _.template(threadSrc);
            countTpl = _.template(countSrc);
        },

        stop: function () {
            threadTpl = countTpl = null;
        },

        pageFooter: function (req, res) {
            var name = cfg.get('theme:custom:disqus:shortname'),
                data = {shortname: name},
                code = [];

            if (!name) { return; }

            if (res.locals.post) { code.push(threadTpl(data)); }
            code.push(countTpl(data));

            return code.join('');
        }
    };

    require('pkginfo')(module, 'version');

}());