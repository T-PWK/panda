var _ = require('underscore');

function Blog () {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(this);
    _.extend.apply(_, args)
};

module.exports = Blog;