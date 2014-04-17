(function () {
    "use strict";

    var express = require('express'),
        api     = require('./../controllers/api'),
        auth    = require('./../middleware/authentication'),
        ips     = require('./../middleware/ips');

    module.exports = function (app) {
        var apiRoutes   = express.Router(),
            posts       = express.Router(),
            redirects   = express.Router(),
            themes      = express.Router(),
            ipRoutes    = express.Router(),
            settings    = express.Router(),
            users       = express.Router();

        settings
            .param('id', api.settings.load)
            .get('/', api.settings.index)
            .get('/:id', api.settings.show)
            .post('/', api.settings.create);

        ipRoutes
            .get('/:type', api.ips.index)
            .put('/:type', api.ips.create);

        themes
            .get('/site', api.themes.index)
            .put('/site/:id', api.themes.update)
            .get('/admin', api.adminthemes.index)
            .put('/admin/:id', api.adminthemes.update);

        users
            .get('/', api.users.index)
            .put('/:type', api.users.update);

        redirects
            .get('/', api.redirects.index)
            .post('/', api.redirects.create)
            .get('/:id', api.redirects.show)
            .put('/:id', api.redirects.update)
            .delete('/:id', api.redirects.destroy);

        posts
            .param('post', api.posts.load)
            .get('/', api.posts.index)
            .post('/', api.posts.create)
            .get('/infos/:info', api.postsinfo.show)
            .get('/:post', api.posts.show)
            .put('/:post', api.posts.update);

        apiRoutes.use(ips.adminIpCheck).use(auth.authCheck)
            .post('/upload', api.fileUpload)
            .get('/labels', api.labels.index)
            .use('/posts', posts)
            .use('/user', users)
            .use('/themes', themes)
            .use('/ips', ipRoutes)
            .use('/settings', settings)
            .use('/config/redirects', redirects);

        app.use('/api/v1', apiRoutes);
    };

}());