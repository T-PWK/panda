(function () {
    'use strict';

    module.exports = function (schema) {
        schema.virtual('id').get(function () { return this._id; });
        schema.set('toJSON', { virtuals: true });
        schema.set('toObject', { virtuals: true });

        // Remove _id from object and JSON transformations
        schema.options.toObject.transform = removeDefaultId;
        schema.options.toJSON.transform = removeDefaultId;

        function removeDefaultId (doc, ret) {
            delete ret._id;
        }
    };

})();