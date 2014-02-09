var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
    slug: { type: String, required: true },
    title: { type: String, required: true },
    created: { type: Date, required: true, default: Date.now },
    updated: { type: Date, required: true, default: Date.now },
    scheduled: { type: Date, default: Date.now },
    labels: { type: [String] },
    geo: { type: [Number] },
    hidden: { type: Boolean, default:false },
    content: String,
    excerpt: String,
    counter: {
        view: { type: Number, default: 0 },
        edit: { type: Number, default: 0 }
    }
});

module.exports = postSchema;