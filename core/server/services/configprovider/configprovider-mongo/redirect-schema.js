(function () {
    'use strict';

    var mongoose = require('mongoose');

    var redirectSchema = mongoose.Schema({
        from: { type: String, required: true, trim: true },
        to: { type: String, required: true, trim: true },
        type: String,

        // # Dates
        createdAt: { type: Date, required: true, default: Date.now },
        updatedAt: { type: Date, required: true, default: Date.now }
    });

    redirectSchema.pre('save', function (next) {
        this.updatedAt = new Date();
        next();
    });

    module.exports = redirectSchema;

})();