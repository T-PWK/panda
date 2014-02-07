var when            = require('when'),
    cfg             = require('nconf'),
    PostProvider    = require('./services/postprovider'); 

var postProvider = module.exports.postProvider = new PostProvider()

module.exports.init = function () {
    return postProvider.init();
};