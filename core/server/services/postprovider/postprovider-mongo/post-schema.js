var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
    // # Content properties
    slug: { type: String, required: true },
    title: { type: String, required: true },
    content: String,
    excerpt: String,
    labels: { type: [String] },

    // # Metadata
    metaTitle: String,
    metaDescription: String,

    // # Dates
    created: { type: Date, required: true, default: Date.now },
    updated: { type: Date, required: true, default: Date.now },
    scheduled: { type: Date, default: Date.now },
    
    // # Additional properties
    geo: { type: [Number] },
    hidden: { type: Boolean, default:false },
    page: Boolean,

    // # Conters
    counter: {
        view: { type: Number, default: 0 },
        edit: { type: Number, default: 0 }
    }
});

module.exports = postSchema;