(function () {
    'use strict';

    var mongoose = require('mongoose');
    var RedirectSchema = new mongoose.Schema({
        from: { type: String, required: true, trim: true },
        to: { type: String, required: true, trim: true },
        type: String,

        // # Dates
        createdAt: { type: Date, required: true, default: Date.now },
        updatedAt: { type: Date, required: true, default: Date.now }
    });

    module.exports = RedirectSchema;

})();