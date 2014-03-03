var mongoose    = require('mongoose'),
    userSchema  = require('./user-schema');

module.exports = mongoose.model('User', userSchema);