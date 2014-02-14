var format        = require('util').format,
    moment        = require('moment'),
    cfg           = require('nconf'),
    _             = require('underscore')
    pgnUrl        = cfg.get('app:pageUrlFormat'),
    pgnRegexp     = new RegExp(pgnUrl.replace(/\//g, '\\/').replace(':page', '\\d+'));

/*
 * Builds post or static page URL
 */
function postUrl (post, absolute) {
    var output = post.page ? '/:slug' : cfg.get('app:urlFormat'),
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

/*
 * Builds pagination URL
 */
function paginationUrl (pgn, type) {
    var page = 'newer' === type ? pgn.newer : pgn.older,
        ctx = pgn.context.replace(pgnRegexp, '');

    if ('/' === ctx) ctx = '';

    return 1 === page ? '/' : ctx + pgnUrl.replace(':page', page);
}

/*
 * Formats scheduled date for the given post and date format
 */
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

function bodyClass () {
    return "post-template";
}

function postClass (post) {
    return "";
}

function initRequest (req, res, next) {
    console.info('init requst')
    next();
}

function init (app) {
    _.extend(
        app.locals, 
        {
            $url: postUrl,
            $pageUrl: paginationUrl,
            $labels: labelsFormat,
            $date: dateFormat,
            $encode: encode,
            $metaTitle: metaTitle,
            $bodyClass: bodyClass,
            $postClass: postClass
        }, 
        cfg.get('view')
    );
    
    app.use(initRequest);
};

module.exports = init;