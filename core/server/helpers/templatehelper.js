var moment        = require('moment'),
    cfg           = require('nconf'),
    _s            = require('underscore.string'),
    pgnUrl        = cfg.get('app:pageUrlFormat'),
    pgnRegexp     = new RegExp(pgnUrl.replace(/\//g, '\\/').replace(':page', '\\d+'));

/*
 * Builds post or static page URL
 */
function postUrl (post, absolute) {
    if (arguments.length < 2 && 'boolean' === typeof post) {
        absolute = post;
        post = this.locals.post;  
    }

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
 * It assumes that 'this' is current response
 */
function pageUrl (newer) {
    var pagination = this.locals.pagination,
        page = newer ? pagination.newer : pagination.older,
        ctx = this.locals.context.replace(pgnRegexp, '');

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
    if(2 > arguments.length && 'string' === typeof post) {
        join = post;
        post = this.locals.post;
    }

    return post.labels.join(join || ', ');
};

function metaTitle () {
    return cfg.get('app:defaultMetaTitle') || cfg.get('app:title');
}

function metaDescription () {
    return cfg.get('app:defaultMetaDesc') || cfg.get('app:description');
}

function metaKeywords () {
    return cfg.get('app:defaultKeywords');
}

function encode (text) {
    return encodeURIComponent(text);
}

function labelToClass (post) {
    return (post.labels || []).map(function (label) {
        return 'tag-' + _s.slugify(label)
    })
}

function bodyClass () {
    if ('/' === this.locals.context) return 'home-template';
    if (+this.req.params.page) return 'archive-template';
    
    var post = this.locals.post;
    if (post) {
        var bodyClass = labelToClass(post);
        bodyClass.push('post-template');
        
        if (post.page) bodyClass.push('page');

        return bodyClass;
    }
}

function postClass (post) {
    post = post || this.locals.post;

    var postClass = labelToClass(post);
    postClass.push('post');
    
    return postClass;
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
        context:    req.path,
        metaTitle:  metaTitle,
        $postClass: postClass.bind(res),
        $url:       postUrl.bind(res),
        $pageUrl:   pageUrl.bind(res),
        $labels:    labelsFormat.bind(res)
    })

    Object.defineProperties(res.locals, {
        "bodyClass": { enumerable: true, get: bodyClass.bind(res) },
        "metaTitle": { enumerable: true, get: metaTitle.bind(res) },
        "metaDescription": { enumerable: true, get: metaDescription.bind(res) },
        "metaKeywords":  { enumerable: true, get: metaKeywords.bind(res) }
    })

    next();
}

function init (app) {

    // Set default application local variables as well as template helper functions
    app.locals({
        title:          cfg.get('app:title'),
        description:    cfg.get('app:description'),
        url:            cfg.get('url'),
        copyright:      cfg.get('app:copyright'),
        cover:          '/assets/img/header.jpg',
        $date:          dateFormat,
        $encode:        encode,
        $postClass:     postClass,
        $assets:        assets.bind(app)
    })

    // Update application locals with view settings like debug or pretty formatting
    app.locals(cfg.get('view'));

    // Initialize reqest / response specific variables
    app.use(initRequest);
};

module.exports = init;