(function () {
    'use strict';

    var mongoose    = require('mongoose'),
        _           = require('underscore'),
        idsPlugin   = require('./plugins/idsPlugin'),

        ConfigSchema  = mongoose.Schema({
            // # Content properties
            key: { type: String, required: true, trim: true },
            val: Object
        });

    ConfigSchema.virtual('value')
        .get(function () {
            return JSON.parse(this.val);
        })
        .set(function (value) {
            this.val = JSON.stringify(value);
        });

    ConfigSchema.plugin(idsPlugin);
    ConfigSchema.path('key').index({ unique: true });

    module.exports = mongoose.model('Config', ConfigSchema);

}());