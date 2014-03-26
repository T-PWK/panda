(function () {
    'use strict';

    var mongoose        = require('mongoose'),
        idsPlugin       = require('../../../models/mongoose/plugins/idsPlugin'),
        RedirectSchema  = new mongoose.Schema({
            from: { type: String, required: true, trim: true },
            to: { type: String, required: true, trim: true },
            type: String,

            // # Dates
            createdAt: { type: Date, required: true, default: Date.now },
            updatedAt: { type: Date, required: true, default: Date.now }
        });

    RedirectSchema.plugin(idsPlugin);

    module.exports = RedirectSchema;

})();