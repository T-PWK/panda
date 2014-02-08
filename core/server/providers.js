var when            = require('when'),
    cfg             = require('nconf'),
    PostProvider    = require('./services/postprovider'),
    postProvider    = new PostProvider();

module.exports = {
    postProvider: postProvider,

    init: function (argument) {
        return postProvider.init();
    }
};