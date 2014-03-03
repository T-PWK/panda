var mongoose        = require('mongoose'),
    redirectSchema  = require('./redirect-schema');

module.exports = mongoose.model('Redirect', redirectSchema);