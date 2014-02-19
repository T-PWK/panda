var moment        = require('moment'),
    cfg           = require('nconf'),
    _s            = require('underscore.string'),
    pgnUrl        = cfg.get('app:pageUrlFormat'),
    pgnRegexp     = new RegExp(cfg.get('app:pageUrlRegExp'));

/*
 * Builds post or static page URL.
 * It is assumed that 'this' is the current resonse
 */
function postUrl (post, absolute) {
    if (arguments.length < 2 && 'boolean' === typeof post) {
        absolute = post;
        post = this.locals.post;  
    }

    var output = post.page ? '/:slug' : cfg.get('app:urlFormat'),
        tags = {
            ':year':   function () { return moment(post.publishedAt).format('YYYY'); },
            ':month':  function () { return moment(post.publishedAt).format('MM'); },
            ':day':    function () { return moment(post.publishedAt).format('DD'); },
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

    return 1 === page
        ? ('' === ctx ? '/' : ctx)
        : ('/' === ctx ? '' : ctx) + pgnUrl.replace(':page', page);
}

/*
 * Formats published date for the given post and date format
 */
function dateFormat (post, opts) {
    if (!post && !post.publishedAt) return '';

    opts = opts || { format: "YYYY-MM-DD" }

    if ('string' === typeof opts) {
        opts = { format: opts };
    }

    var date = moment(post.publishedAt);

    if (opts.timeago) {
        return date.fromNow();
    }
    if (opts.format) {
        return date.format(opts.format);
    }
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

function encode (text) {
    return encodeURIComponent(text);
}

function labelToClass (labels) {
    return (labels || []).map(function (label) {
        return 'tag-' + _s.slugify(label)
    })
}

function buildBodyClass () {
    // Main page template
    if ('/' === this.locals.context) return 'home-template';

    // Any pagination template
    if (+this.req.params.page) return 'archive-template';
    
    // Post or static page template (when res.locals.post is present)
    var post = this.locals.post;
    if (post) {
        var bodyClass = labelToClass(post.labels);
        bodyClass.push('post-template');
        
        // If post is actually a static page
        if (post.page) bodyClass.push('page');

        return bodyClass;
    }
}

function buildPostClass (post) {
    post = post || this.locals.post;

    var postClass = ['post'];

    if(post) {
        Array.prototype.push.apply(postClass, labelToClass(post.labels));
    }

    return postClass;
}

function copyright () {
    var app = this,
        tags = {
            ':year' : function () { return moment().format('YYYY'); },
            ':url'  : function () { return app.locals.url; },
            ':title': function () { return app.locals.title; }
        };
    return cfg.get('app:copyright').replace(/(:[a-z]+)/g, function (match) {
        if (match in tags) return tags[match]();
    })
}

function author () {
    return this.locals.post && this.locals.post.author;
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
    Object.defineProperties(res.locals, {

        context:    { enumerable: true, value: req.path },
        now:        { enumerable: true, value: moment() },
        $postClass: { enumerable: true, value: buildPostClass.bind(res) },
        $url:       { enumerable: true, value: postUrl.bind(res) },
        $pageUrl:   { enumerable: true, value: pageUrl.bind(res) },
        $labels:    { enumerable: true, value: labelsFormat.bind(res) },
        bodyClass: { enumerable: true, get: buildBodyClass.bind(res) },
        postClass: { enumerable: true, get: buildPostClass.bind(res) },
        metaTitle: { enumerable: true, get: metaTitle.bind(res) },
        metaDescription: { enumerable: true, get: metaDescription.bind(res) },
        author: { enumerable: true, get: author.bind(res) }
    })

    next();
}

function init (app) {
    // Set default application local variables as well as template helper functions
    Object.defineProperties(app.locals, {
        title: { enumerable:true, value: cfg.get('app:title') },
        description: { enumerable: true, value: cfg.get('app:description') },
        url: { enumerable: true, value: cfg.get('url') },
        cover: { enumerable: true, value: cfg.get('theme:cover') },
        copyright: { enumerable:true, get: copyright.bind(app) },
        $date: { enumerable:true, value: dateFormat },
        $encode: { enumerable:true, value: encode },
        $assets: { enumerable:true, value: assets.bind(app) },

        // Update application locals with view settings like debug or pretty formatting
        pretty: { enumerable:true, value: cfg.get('view:pretty') },
        debug: { enumerable:true, value: cfg.get('view:debug') }
    })

    // Initialize reqest / response specific variables
    app.use(initRequest);
};

module.exports = init;