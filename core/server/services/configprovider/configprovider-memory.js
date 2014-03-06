var when        = require('when'),
    path        = require('path'),
    fs          = require('fs'),
    nodefn      = require('when/node/function'),
    cfg         = require('nconf'),
    _           = require('underscore');

var ConfigProvider = module.exports = function () {
    this.redirects = {};
};

ConfigProvider.prototype.init = function () {
    var that        = this,
        dataFile    = path.join(cfg.get('paths:data'), 'redirects.json'),
        loadData    = nodefn.call(fs.readFile, dataFile);

    return loadData
        .then(function (redirects) {
            that.redirects = _.extend({}, JSON.parse(redirects), cfg.get('redirects'));
        });
};

ConfigProvider.prototype.findRedirectByUrl = function (url) {
    return when(this.redirects[url]);
};