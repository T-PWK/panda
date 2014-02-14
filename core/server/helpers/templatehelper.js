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
function pageUrl (pgn, type) {
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
    var foo = undefined;
    console.info(+foo > 1)
    if ('/' === this.locals.context) return 'home-template';
    if (this.req.params.page > 1) return 'archive-template';
}

function postClass (post) {
    return "";
}

/*
 * Generates an asset URL.
 * It assumes that 'this' is current application
 */
function assets (asset) {
    return '/assets' + ('/' === asset[0] ? '' : '/') + asset + '?v=ad2e223fd'
}

function initRequest (req, res, next) {
    // Set default response local variables
    res.locals({
        context: req.path
    })

    Object.defineProperties(res.locals, {
        "bodyClass": {
            enumerable: true,
            get: bodyClass.bind(res)
        }
    })

    next();
}

function init (app) {

    // Set default application local variables as well as template helper functions
    app.locals({
        metaTitle:      cfg.get('app:defaultMetaTitle') || cfg.get('app:title'),
        metaDesc:       cfg.get('app:defaultMetaDesc') || cfg.get('app:description'),
        metaKeywords:   cfg.get('app:defaultKeywords'),
        title:          cfg.get('app:title'),
        description:    cfg.get('app:description'),
        url:            cfg.get('url'),
        cover:          '/assets/img/header.jpg',
        $url:           postUrl,
        $pageUrl:       pageUrl,
        $labels:        labelsFormat,
        $date:          dateFormat,
        $encode:        encode,
        $metaTitle:     metaTitle,
        $postClass:     postClass,
        $assets:        assets.bind(app)
    })

    // Update application locals with view settings like debug or pretty formatting
    app.locals(cfg.get('view'));

    // Initialize reqest / response specific variables
    app.use(initRequest);
};

module.exports = init;