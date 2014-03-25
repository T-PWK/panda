(function () {
    'use strict';

    var passport = require('passport');

    module.exports = function (app) {
        app.post('/login',
            passport.authenticate('local', {
                successRedirect: '/admin', failureRedirect: '/login', failureFlash: 'Invalid username or password.'
            })
        );
    };

})();