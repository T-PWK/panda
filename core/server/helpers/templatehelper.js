var format  = require('util').format,
    moment  = require('moment')
    cfg     = require('nconf');


function urlFormat (post) {
    var output = post.page ? '/:slug/' : cfg.get('app:urlformat'),
        tags = {
            ':year':   function () { return moment(post.published_at).format('YYYY'); },
            ':month':  function () { return moment(post.published_at).format('MM'); },
            ':day':    function () { return moment(post.published_at).format('DD'); },
            ':slug':   function () { return post.slug; },
            ':id':     function () { return post.id; }
        };

    // replace tags like :slug or :year with actual values
    output = output.replace(/(:[a-z]+)/g, function (match) {
        if (match in tags) {
            return tags[match]();
        }
    });

    return output;
};

function dateFormat (post, format) {
    return post.scheduled
        ? moment(post.scheduled).format(format || "YYYY-MM-DD")
        : '';
};

function labelsFormat (post, join) {
    return post.labels.join(join || ', ');
};

function init (app) {
    app.locals.tpl = exports;
};

module.exports.init   = init;
module.exports.url    = urlFormat;
module.exports.labels = labelsFormat;
module.exports.date   = dateFormat;