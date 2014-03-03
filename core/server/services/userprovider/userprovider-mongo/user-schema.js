var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    // # Content properties
    name: { type: String, required: true },
    email: { type: String, required: true, trim: true },
    website: { type: String, required: false, trim: true },
    bio: String,
    image: String,
    lead: Boolean,

    // # Dates
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
    
});

userSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
})

module.exports = userSchema;