(function () {
    'use strict';

    var cfg         = require('nconf'),
        passport    = require('passport'),
        join        = require('path').join;

    module.exports.index = function (req, res) {
        res.render(join(cfg.get('paths:adminViews'), 'admin'));
    };

    module.exports.loginView = function loginView (req, res) {
        res.render(join(cfg.get('paths:adminViews'), 'admin/login'),
            { messages: req.flash('error') }
        );
    };

    module.exports.login = passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: 'There was an error with your E-Mail/Password combination. Please try again.'
    });

    module.exports.partial = function (req, res) {
        res.render(join(cfg.get('paths:adminViews'), 'admin/partial/' + req.params.name));
    };

    module.exports.logout = function (req, res) {
        req.logout();
        res.redirect('/login');
    };
})();