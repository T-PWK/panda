var _ = require('underscore');

function Application () {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(this);
    _.extend.apply(_, args)
};

module.exports = Application;