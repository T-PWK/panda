var mongoose    = require('mongoose'),
    postSchema  = require('./post-schema');

module.exports = mongoose.model('Post', postSchema);