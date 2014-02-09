var format  = require('util').format,
    moment  = require('moment')
    cfg     = require('nconf');

function urlFormat (post, absolute) {
    var output = post.page ? '/:slug/' : cfg.get('app:urlFormat'),
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

    return absolute ? cfg.get('url') + output : output;
};

function dateFormat (post, format) {
    return post.scheduled
        ? moment(post.scheduled).format(format || "YYYY-MM-DD")
        : '';
};

function labelsFormat (post, join) {
    return post.labels.join(join || ', ');
};

function metaTitle (blog, post) {
    return "";
}

function encode (text) {
    return encodeURIComponent(text);
}

function init (app) {
    app.locals.tpl = module.exports;
};

module.exports = {
    init: init,
    url: urlFormat,
    labels: labelsFormat,
    date: dateFormat,
    encode: encode,
    metaTitle: metaTitle
}