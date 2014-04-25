(function () {
    'use strict';

    var moment          = require('moment'),
        cfg             = require('nconf'),
        _               = require('lodash'),
        _s              = require('underscore.string'),
        themesProvider  = require('../providers').themesProvider,
        labelUrlFormat  = cfg.get('app:labelUrl'),
        pgnUrl          = cfg.get('app:paginationUrl'),
        pgnRegexp       = new RegExp(pgnUrl.replace(':page', '\\d+'));

    /*
     * Builds post or static page URL.
     * It is assumed that 'this' is the current response
     */
    function postUrl(locals, post, absolute) {
        if (arguments.length < 3 && 'boolean' === typeof post) {
            absolute = post;
            post = locals.post;
        }

        var output = post.page ? cfg.get('app:pageUrl') : cfg.get('app:postUrl'),
            tags = {
                ':year': function () {
                    return moment(post.publishedAt).format('YYYY');
                },
                ':month': function () {
                    return moment(post.publishedAt).format('MM');
                },
                ':day': function () {
                    return moment(post.publishedAt).format('DD');
                },
                ':slug': function () {
                    return post.slug;
                },
                ':id': function () {
                    return post.id || post._id;
                }
            };

        // replace tags like :slug or :year with actual values
        output = output.replace(/(:[a-z]+)/g, function (match) {
            if (match in tags) {
                return tags[match]();
            }
        });

        return absolute ? cfg.get('url') + output : output;
    }

    function labelUrl(label, absolute) {
        return (absolute ? cfg.get('url') : '') +
            labelUrlFormat.replace(':label', encodeURIComponent(label));
    }

    /*
     * Builds pagination URL
     */
    function pageUrl(locals, newer) {
        var pagination = locals.pagination,
            page = newer ? pagination.newer : pagination.older,
            ctx = locals.context.replace(pgnRegexp, '');

        return 1 === page ? ('' === ctx ? '/' : ctx)
            : ('/' === ctx ? '' : ctx) + pgnUrl.replace(':page', page);
    }

    /*
     * Formats given date. If the given date is a post then 'publishedAt' date is taken for formatting.
     */
    function dateFormat(locals, post, format) {
        if (arguments.length < 3) {
            if (_.isString(post)) {
                format = post;
                post = locals.post;
            } else {
                format = "YYYY-MM-DD";
            }
        }

        var date = (_.isDate(post) || moment.isMoment(post)) ? post : post.publishedAt;

        if (!date) return '';

        var mdate = moment(date);

        switch (format) {
            case 'timeago':
                return mdate.fromNow();
            case 'utc':
                return mdate.utc();
            case 'iso':
                return mdate.toISOString();
            default:
                return mdate.format(format);
        }
    }

    function labelsFormat(locals, post, join) {
        if (3 > arguments.length && 'string' === typeof post) {
            join = post;
            post = locals.post;
        }

        return (post.labels || []).join(join || ', ');
    }

    function metaTitle(locals) {
        var post = locals.post,
            tokens = {
                ':blogtitle': function () {
                    return cfg.get('app:title');
                },
                ':posttitle': function () {
                    return post.title;
                },
                ':authorname': function () {
                    return post.author ? post.author.name : '';
                }
            };

        return (post) ?
            cfg.get('app:postMetaTitleFormat').replace(/:[a-z]+/ig, function (token) {
                if (token in tokens) return tokens[token]();
            })
            : cfg.get('app:metaTitle') || cfg.get('app:title');
    }

    function metaDescription() {
        return cfg.get('app:metaDescription') || cfg.get('app:description');
    }

    function encode(text) {
        return encodeURIComponent(text);
    }

    function labelToClass(labels) {
        return (labels || []).map(function (label) {
            return 'tag-' + _s.slugify(label);
        });
    }

    function buildBodyClass(res) {
        // Main page template
        if ('/' === res.locals.context) return 'home-template';

        // Any pagination template
        if (+res.req.params.page) return 'archive-template';

        // Post or static page template (when res.locals.post is present)
        var post = res.locals.post;
        if (post) {
            var bodyClass = labelToClass(post.labels);
            bodyClass.push('post-template');

            // If post is actually a static page
            if (post.page) bodyClass.push('page');

            return bodyClass;
        }
    }

    function buildPostClass(locals, post) {
        post = post || locals.post;

        var postClass = ['post'];

        if (post) {
            Array.prototype.push.apply(postClass, labelToClass(post.labels));
        }

        return postClass;
    }

    function copyright(locals) {
        var tags = {
                ':year': function () {
                    return moment().format('YYYY');
                },
                ':url': function () {
                    return locals.url;
                },
                ':title': function () {
                    return locals.title;
                }
            };

        return cfg.get('app:copyright').replace(/(:[a-z]+)/g, function (match) {
            if (match in tags) return tags[match]();
        });
    }

    function author(locals) {
        return locals.post && locals.post.author;
    }

    function ifCheck(value, element, checkValue) {
        return element === checkValue ? value : undefined;
    }

    /*
     * Generates an asset URL.
     * It assumes that 'this' is current application
     */
    function assets(asset) {
        return '/assets' + ('/' === asset[0] ? '' : '/') + asset + '?v=' + module.exports.version;
    }

    function isntEmpty(obj, prop) {
        var value;

        if (arguments.length === 1) {
            value = obj;
        }
        else if (arguments.length === 2) {
            value = obj[prop];
        }

        if (!value) {
            return false;
        }
        if (_.isString(value) || _.isArray(value)) {
            return value.length > 0;
        }

        return true;
    }

    function reqLocals(req, res, next) {
        // Set default response local variables

        Object.defineProperties(res.locals, {
            context:         { enumerable: true, value: req.path },
            title:           { enumerable: true, value: cfg.get('app:title') },
            description:     { enumerable: true, value: cfg.get('app:description') },
            metaTitle:       { enumerable: true, get: metaTitle.bind(null, res.locals) },
            metaDescription: { enumerable: true, get: metaDescription.bind(res) },
            now:             { enumerable: true, value: moment() },
            url:             { enumerable: true, value: cfg.get('url') },
            copyright:       { enumerable: true, get: copyright.bind(null, res.locals) },
            $postClass:      { enumerable: true, value: buildPostClass.bind(null, res.locals) },
            $url:            { enumerable: true, value: postUrl.bind(null, res.locals) },
            $pageUrl:        { enumerable: true, value: pageUrl.bind(null, res.locals) },
            $labels:         { enumerable: true, value: labelsFormat.bind(null, res.locals) },
            $date:           { enumerable: true, value: dateFormat.bind(null, res.locals) },
            bodyClass:       { enumerable: true, get: buildBodyClass.bind(null, res) },
            postClass:       { enumerable: true, get: buildPostClass.bind(null, res.locals) },
            author:          { enumerable: true, get: author.bind(null, res.locals) },
            user:            { enumerable: true, value: req.user },
            adminTheme:      { enumerable: true, get: themesProvider.getActiveAdminTheme.bind(themesProvider) }
        });

        next();
    }

    function appLocals(app) {
        // Set default application local variables as well as template helper functions
        Object.defineProperties(app.locals, {
            custom:     { enumerable: true, value: cfg.get('theme:custom') },
            cover:      { enumerable: true, value: cfg.get('theme:cover') },
            logo:       { enumerable: true, value: cfg.get('theme:logo') },
            version:    { enumerable: true, value: module.exports.version },
            $encode:    { enumerable: true, value: encode },
            $assets:    { enumerable: true, value: assets.bind(app) },
            $if:        { enumerable: true, value: ifCheck },
            $isntEmpty: { enumerable: true, value: isntEmpty },
            $labelUrl:  { enumerable: true, value: labelUrl },

            // Update application locals with view settings like debug or pretty formatting
            pretty:     { enumerable: true, value: cfg.get('view:pretty') },
            debug:      { enumerable: true, value: cfg.get('view:debug') }
        });

        // Initialize reqest / response specific variables
        app.use(reqLocals);
    }

    module.exports = appLocals;
    module.exports.requestLocals = reqLocals;

    require('pkginfo')(module, 'version');

})();