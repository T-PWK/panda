(function () {
    "use strict";

    var cfg             = require('nconf'),
        express         = require('express'),
        passport        = require('passport'),
        bodyParser      = require('body-parser'),
        cookieSession   = require('cookie-session'),
        api             = require('./../controllers/api'),
        auth            = require('./../middleware/authentication'),
        ips             = require('./../middleware/ips');

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

        ipRoutes // admin site
            .param('type', api.ips.paramType)
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
            .param('id', api.posts.load)
            .get('/', api.posts.index)
            .post('/', api.posts.create)
            .get('/infos/:info', api.postsinfo.show)
            .get('/:id', api.posts.show)
            .put('/:id', api.posts.update)
            .delete('/:id', api.posts.destroy);

        apiRoutes
            .use(ips.adminIpCheck)
            .use(cookieSession({
                cookie: { maxAge: cfg.get('admin:sessionCookieMaxAge') },
                secret: cfg.get('admin:sessionSecret')
            }))
            .use(passport.initialize())
            .use(passport.session())
            .use(auth.authCheck)
            .use(bodyParser())
            .post('/upload', api.fileUpload)
            .get('/labels', api.labels.index)
            .use('/posts', posts)
            .use('/user', users)
            .use('/themes', themes)
            .use('/ips', ipRoutes)
            .use('/settings', settings)
            .use('/redirects', redirects);

        app.use('/api/v1', apiRoutes);
    };

}());