(function () {
    'use strict';

    var mongoose = require('mongoose'),
        RedirectSchema = require('./redirect-schema');

    module.exports = mongoose.model('Redirect', RedirectSchema);

})();