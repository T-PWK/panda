(function () {
    'use strict';

    var cfg = require('nconf');

    module.exports = function (req, posts) {
        var pages = Math.ceil(posts / cfg.get('app:postsPerPage')),
            page = +req.params.page || 1;

        return {
            context: req.path,
            pages: pages,
            page: page,
            older: page < pages ? page + 1 : undefined,
            newer: page > 1 ? page - 1 : undefined
        };
    };

}());