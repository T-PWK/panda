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
            publishedAt: { type: Date },

            published: { type: Boolean, default: false },

            // # Additional properties
            geo: { type: [Number] },
            page: { type: Boolean, default: false },
            featured: { type: Boolean, default: false },

            commentsCount: { type: Number, default: 0 },

            // # Post edition options
            autoSlugOpt: { type: Boolean, default: false },
            autoPublishOpt: { type: Boolean, default: false },

            // # Counters
            counter: {
                view: { type: Number, default: 0 },
                edit: { type: Number, default: 0 }
            }
        });

    PostSchema.plugin(idsPlugin);

    PostSchema.path('slug').index({ unique: true, sparse: true });
    PostSchema.path('publishedAt').index(true);
    PostSchema.path('published').index({ sparse: true });

    module.exports = mongoose.model('Post', PostSchema);

})();