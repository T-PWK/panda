(function () {
    'use strict';

    var mongoose    = require('mongoose'),
        _           = require('underscore'),
        idsPlugin   = require('./plugins/idsPlugin'),

        ConfigSchema  = mongoose.Schema({
            // # Content properties
            key: { type: String, required: true, trim: true },
            strValue: { type: String },
            boolValue: { type: Boolean },
            numValue: { type: Number },
            type: { type: String, require: true, default:'string' }
        });

    ConfigSchema.virtual('value')
        .get(function () {
            switch(this.type) {
                case 'string': return this.strValue;
                case 'boolean': return this.boolValue;
                case 'number': return this.numValue;
                default: return undefined;
            }
        })
        .set(function (value) {
            if (_.isNumber(value)) {
                this.type = 'number';
                this.numValue = value;
                this.boolValue = this.strValue = undefined;
            } else if (_.isBoolean(value)) {
                this.type = 'boolean';
                this.boolValue = value;
                this.numValue = this.strValue =undefined;
            } else {
                this.type = 'string';
                this.strValue = '' + value;
                this.boolValue = this.numValue = undefined;
            }
        });

    ConfigSchema.plugin(idsPlugin);
    ConfigSchema.path('key').index({ unique: true });

    module.exports = mongoose.model('Config', ConfigSchema);

}());