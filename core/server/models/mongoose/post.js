(function () {
    'use strict';

    var mongoose    = require('mongoose'),
        idsPlugin   = require('./plugins/idsPlugin'),

        PostSchema  = mongoose.Schema({
            // # Content properties
            slug: { type: String, trim: true, lowercase: true },
            title: { type: String, trim: true },
            content: String,
            markdown: String,
            teaser: String,
            labels: { type: [String] },

            author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

            // # Metadata
            metaDescription: String,

            // # Dates
            createdAt: { type: Date, required: true, default: Date.now },
            updatedAt: { type: Date, required: true, default: Date.now },
            publishedAt: { type: Date, default: null },
            scheduledAt: Date,

            // # Additional properties
            geo: { type: [Number] },
            page: { type: Boolean, default: false },
            featured: { type: Boolean, default: false },

            commentsCount: { type: Number, default: 0 },

            // # Post edition options
            slugOpt: { type: Boolean, default: false },
            scheduleOpt: { type: Boolean, default: false },

            // # Counters
            counter: {
                view: { type: Number, default: 0 },
                edit: { type: Number, default: 0 }
            }
        });

    PostSchema.plugin(idsPlugin);

    PostSchema.path('slug').index({ unique: true, sparse: true });
    PostSchema.path('publishedAt').index(true);

    module.exports = mongoose.model('Post', PostSchema);

})();