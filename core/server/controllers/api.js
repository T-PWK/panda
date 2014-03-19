var when        = require('when'),
    provider    = require('../providers').postProvider;

module.exports.posts        = require('./api/posts');
module.exports.themes       = require('./api/themes');
module.exports.adminthemes  = require('./api/adminthemes');
module.exports.labels       = require('./api/labels');
module.exports.postsinfo    = require('./api/postsinfo');


// module.exports.pages = function (req, res) {
//     provider
//         .fetchAll({ post: false, limit: +req.query.limit, sortBy: req.query.sortBy })
//         .then(res.json.bind(res));
// };