var passport        = require('passport'),
    LocalStrategy   = require('passport-local').Strategy,
    provider        = require('../providers').userProvider,
    bcrypt          = require('bcryptjs');

module.exports = function () {
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function (username, password, done) {
            return provider
                .findByEmail(username)
                .then(function (user) {
                    return bcrypt.compare(password, user.hash,
                        function (err, res) {
                            if (err) return done(err);
                            if (res) done(null, user);
                            else done(null, false);
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

module.exports.loggedIn = function (req, res, fn) {
    if (req.isAuthenticated()) { fn(); } else { res.redirect(302, '/login'); }
};