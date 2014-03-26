(function () {
    'use strict';

    var mongoose    = require('mongoose'),
        idsPlugin   = require('./plugins/idsPlugin'),

        PostSchema  = mongoose.Schema({
            // # Content properties
            slug: { type: String, required: true, trim: true },
            title: { type: String, required: true, lowercase: true, trim: true },
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
            publishedAt: Date,

            // # Additional properties
            geo: { type: [Number] },
            published: { type: Boolean, required: true, default: false },
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

    module.exports = mongoose.model('Post', PostSchema);

})();