var cfg = require('nconf');

module.exports = function (posts, page) {

    var howMany = cfg.get('app:postsPerPage'),
        pages = Math.ceil(posts.length / howMany);

    return {
        pages: pages,
        page: page,
        older: page < pages ? { page: page + 1 } : undefined,
        newer: page > 1 ? { page: page - 1 } : undefined
    }
}