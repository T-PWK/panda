var cfg     = require('nconf'),
    join    = require('path').join;


module.exports.index = function (req, res) {
    res.render(join(cfg.get('paths:adminViews'), 'admin'));
};

module.exports.login = function (req, res) {
    res.render(join(cfg.get('paths:adminViews'), 'admin/login'));
};

module.exports.partial = function (req, res) {
    res.render(join(cfg.get('paths:adminViews'), 'admin/partial/'+req.params.name ));
};