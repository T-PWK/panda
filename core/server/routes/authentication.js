(function () {
    'use strict';

    var passport = require('passport');

    module.exports = function (app) {
        app.post('/login',
            passport.authenticate('local', {
                successRedirect: '/admin',
                failureRedirect: '/login',
                failureFlash: 'There was an error with your E-Mail/Password combination. Please try again.'
            })
        );
    };

})();