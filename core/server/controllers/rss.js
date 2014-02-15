var when          = require('when'),
    join          = require('path').join,
    provider      = require('../providers').postProvider;

function view (req, view) {
    return join(req.app.get('admin views'), view);
}

module.exports.rss = function (req, res) {
    when(provider.findAll())
        .then(function (posts) {
            res.locals({ posts: posts });
            res.type('rss').render(view(req, 'rss'));
        })
        .catch(function (err) {
            res.send(500);
        });
}