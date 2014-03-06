require('pkginfo')(module, 'version');

module.exports = function (req, res, next) {
    res.setHeader('X-Powered-By', 'Panda v' + exports.version);
    next();
};