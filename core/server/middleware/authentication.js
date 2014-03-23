var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt');

module.exports = function () {
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function (username, password, done) {
            console.info('username & password', username, password);
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);

            console.info('check password : ',bcrypt.compareSync(password, hash)); // true)

            console.info(hash)

            return done(null, {id:123});
        }
    ));

    passport.serializeUser(function(user, done) {
        console.info('serializeUser')
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        // User.findById(id, function(err, user) {
        //     done(err, user);
        // });
        console.info('deserializeUser')
        done(null, {id:123});
    });
};

module.exports.loggedIn = function (req, res, fn) {
    if (req.isAuthenticated()) fn();
    else res.redirect(302, '/login');
}