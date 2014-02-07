var mongoose    = require('mongoose'),
    postSchema  = require('../schemas/post');

module.exports = mongoose.model('Post', postSchema);