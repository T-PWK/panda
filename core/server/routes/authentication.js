var passport = require('passport');

module.exports = function (app) {
    app.post('/admin/login',
        passport.authenticate('local', {
            successRedirect:'/admin', failureRedirect:'/admin/login'
        })
    );
};