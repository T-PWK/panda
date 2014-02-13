var cfg = require('nconf');

module.exports = function (req, posts) {

    var howMany = cfg.get('app:postsPerPage'),
        pages = Math.ceil(posts / howMany),
        page = +req.params.page || 1;

    return {
        context: req.path,
        pages: pages,
        page: page,
        older: page < pages ? page + 1 : undefined,
        newer: page > 1 ? page - 1 : undefined
    }
}