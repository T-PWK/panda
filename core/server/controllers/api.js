var when        = require('when'),
    provider    = require('../providers').postProvider;

module.exports.posts        = require('./api/posts');
module.exports.themes       = require('./api/themes');
module.exports.adminthemes  = require('./api/adminthemes');
module.exports.labels       = require('./api/labels');
module.exports.postsinfo    = require('./api/postsinfo');
module.exports.redirects    = require('./api/redirects');
module.exports.settings     = require('./api/settings');
module.exports.users        = require('./api/users');
