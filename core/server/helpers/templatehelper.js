var format  = require('util').format,
    moment  = require('moment'),
    cfg     = require('nconf'),
    _       = require('underscore');

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

function pageurl (page) {
    return page == 1 
        ? '/' 
        : cfg.get('app:pageUrlFormat').replace(':page', page);
}

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

function bodyClass (posts) {
    return "post-template";
}

function postClass (post) {
    return "";
}

function init (app) {
    _.extend(
        app.locals, 
        {
            $url: urlFormat,
            $pageurl: pageurl,
            $labels: labelsFormat,
            $date: dateFormat,
            $encode: encode,
            $metaTitle: metaTitle,
            $bodyClass: bodyClass,
            $postClass: postClass
        }, 
        cfg.get('view')
    );
};

module.exports = init;