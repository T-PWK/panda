var cfg     = require('nconf'),
    fs      = require('fs'),
    _       = require('underscore'),
    _s      = require('underscore.string'),
    node    = require('when/node'),
    readdir = node.lift(fs.readdir);

module.exports.index = function (req, res) {
    readdir(cfg.get('paths:themes'))
        .then(namesToThemes)
        .tap(selectActive)
        .then(res.json.bind(res))
        .catch(res.send.bind(res, 500));

    function selectActive (themes) {
        var active = _.findWhere(themes, { id:cfg.get('theme:name') });
        if (active) active.active = true;
    }

    function nameToTheme (name) {
        return {
            id: name,
            name: _s.titleize(_s.humanize(name))
        }
    }

    function namesToThemes (fileNames) {
        return fileNames.map(nameToTheme);
    }
};

module.exports.update = function (req, res) {
    if (cfg.get('theme:name') === req.params.theme) return res.json();

    // readdir(cfg.get('paths:themes'))
    res.json();
};