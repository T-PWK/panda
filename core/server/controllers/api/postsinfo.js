var provider = require('../../providers').postProvider;

module.exports.show = function (req, res) {
    switch(req.params.info) {
        case 'count': return postCountInfo(req, res);
        default: res.send(400);
    }
};

function postCountInfo(req, res) {
    var page = ('undefined' === typeof req.query.page) ? undefined 
        : req.query.page.toLowerCase() === 'true';

    provider.postCountInfo({ page: page }).then(res.json.bind(res));
}
