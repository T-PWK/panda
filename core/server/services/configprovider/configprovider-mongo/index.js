var when = require('when');

var PostProvider = module.exports = function () {
    this.db = mongoose.connection;
}

PostProvider.prototype.init = function () {
    return when();
}

ConfigProvider.prototype.findRedirectByUrl = function () {
}