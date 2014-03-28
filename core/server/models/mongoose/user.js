(function () {
    'use strict';

    var mongoose    = require('mongoose'),
        idsPlugin   = require('./plugins/idsPlugin'),

        UserSchema  = mongoose.Schema({
            // # Content properties
            name: { type: String, required: true },
            email: { type: String, required: true, trim: true },
            password: { type: String, trim: true },
            website: { type: String, required: false, trim: true },
            location: { type: String, required: false, trim: true },
            bio: String,
            image: String,
            lead: Boolean,

            // # Dates
            createdAt: { type: Date, required: true, default: Date.now },
            updatedAt: { type: Date, required: true, default: Date.now }
        });

    UserSchema.plugin(idsPlugin);
    UserSchema.path('email').index({ unique: true });

    module.exports = mongoose.model('User', UserSchema);

}());