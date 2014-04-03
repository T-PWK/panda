(function () {
    'use strict';

    var passport        = require('passport'),
        LocalStrategy   = require('passport-local').Strategy,
        provider        = require('../providers').userProvider,
        crypt           = require('bcryptjs'),
        str             = require('underscore.string');

    module.exports = function () {
        passport.use(
            new LocalStrategy({ usernameField: 'email', passwordField: 'password' },
            function (username, password, done) {
                return provider
                    .findByEmail(username)
                    .then(function (user) {
                        if (!user) {
                            return done(null, false);
                        }

                        return crypt.compare(password, user.password, function (err, res) {
                            if (err) {
                                return done(err);
                            }
                            return (res) ? done(null, user) : done(null, false);
                        });
                    });
            }
        ));

        passport.serializeUser(function(user, done) {
            done(null, user.id);
        });

        passport.deserializeUser(function(id, done) {
            provider.findById(id).then(function (user) {
                done(null, user);
            });
        });
    };

    module.exports.loginCheck = function (req, res, fn) {
        if (req.isAuthenticated()) {
            req.session.access = Date.now(); // refreshing session
            fn();
        } else if (str.startsWith(req.path, '/admin')) {
            res.redirect(302, '/login');
        } else if (str.startsWith(req.path, '/api')) {
            res.send(401);
        }
    };

}());