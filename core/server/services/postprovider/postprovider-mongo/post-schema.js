var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
    // # Content properties
    slug: { type: String, required: true, trim: true },
    title: { type: String, required: true, lowercase: true, trim: true },
    content: String,
    teaser: String,
    labels: { type: [String] },

    // # Metadata
    metaTitle: String,
    metaDescription: String,

    // # Dates
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
    scheduled: { type: Date, default: Date.now },
    
    // # Additional properties
    geo: { type: [Number] },
    published: { type: Boolean, required: true, default: false },
    page: { type: Boolean, default: false },

    // # Conters
    counter: {
        view: { type: Number, default: 0 },
        edit: { type: Number, default: 0 }
    }
});

postSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
})



module.exports = postSchema;