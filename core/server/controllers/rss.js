var cfg           = require('nconf'),
    when          = require('when'),
    join          = require('path').join,
    Application   = require('../models/application'),
    provider      = require('../providers').postProvider;

var application = new Application({
    metaTitle:      cfg.get('app:defaultMetaTitle'),
    metaDesc:       cfg.get('app:defaultMetaDesc'),
    metaKeywords:   cfg.get('app:defaultKeywords'),
    title:          cfg.get('app:title'),
    description:    cfg.get('app:description'),
    url:            cfg.get('url'),
    copyright:      cfg.get('app:copyright'),
    cover:          '/assets/img/Baby-Panda-Wallpaper.jpg'
});

function view (req, view) {
    return join(req.app.get('admin views'), view);
}

module.exports.rss = function (req, res) {
    when(provider.findAll())
        .then(function (posts) {
            res.type('rss').render(view(req, 'rss'), {
                posts: posts,
                app: application
            });
        }).catch(function (err) {
            res.send(500);
        });
}