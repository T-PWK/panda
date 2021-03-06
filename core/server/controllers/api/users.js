(function(){
    'use strict';

    var when        = require('when'),
        _           = require('underscore'),
        crypt       = require('bcryptjs'),
        provider    = require('../../providers').usersProvider;

    module.exports.index = function(req, res) {
        if (!req.user) return res.send(404);

        sendUser(res, req.user);
    };

    module.exports.update = function (req, res) {
        if (!req.user) return res.send(404);

        switch (req.params.type) {
            case 'basic': return updateUser(req, res);
            case 'password': return updatePassword(req, res);
            default: res.send(406);
        }
    };

    function updateUser(req, res) {
        when.resolve(provider.updateUser(req.user.id, req.body))
            .then(sendUser.bind(null, res));
    }

    function updatePassword(req, res) {
        var user = req.user,
            password = _.pick(req.body, 'current', 'change', 'verify');

        // New password does not match password verification
        if (password.change !== password.verify) {
            return res.send(400);
        }

        // Check if the given password matches the saved password
        crypt.compare(password.current, user.password, function (err, result) {
            if (err || !result) {
                return res.send(400);
            }
            when.resolve(provider.updatePassword(user.id, password.change)).done(
                res.send.bind(res, 200),
                res.send.bind(res, 400)
            );
        });
    }

    function sendUser(res, user) {
        res.json(_.pick(user, 'id', 'name', 'email', 'image', 'location', 'website', 'bio', 'lead', 'createdAt', 'updatedAt'));
    }

}());