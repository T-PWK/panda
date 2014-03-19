var when        = require('when'),
    path        = require('path'),
    fs          = require('fs'),
    node        = require('when/node'),
    cfg         = require('nconf'),
    _           = require('underscore');

var ConfigProvider = module.exports = function () {
    this.redirects = {};
};

ConfigProvider.prototype.init = function () {
    var that        = this,
        dataFile    = path.join(cfg.get('paths:data'), 'redirects.json'),
        loadData    = node.call(fs.readFile, dataFile);

    return loadData
        .then(function (redirects) {
            that.redirects = JSON.parse(redirects);
        });
};

ConfigProvider.prototype.findAllRedirects = function () {
    return when.resolve(this.redirects);
};

ConfigProvider.prototype.findRedirectByUrl = function (url) {
    return when.resolve(_.findWhere(this.redirects, { from:url }));
};

ConfigProvider.prototype.findRedirectById = function (id) {

    return when.resolve(_.findWhere(this.redirects, { id:id }));
};