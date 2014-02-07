var _s      = require('underscore.string'),
    format  = require('util').format,
    moment  = require('moment');

function TemplateHelper () {}

TemplateHelper.prototype.url = function (post) {
    return format(
        '/%s/%s/%s.html', 
        post.scheduled.getFullYear(), 
        _s.lpad(post.scheduled.getMonth() + 1, 2, '0'), 
        post.slug
    );
}

TemplateHelper.prototype.date = function (post, format) {
    return post.scheduled
        ? moment(post.scheduled).format(format)
        : '';
}

module.exports = new TemplateHelper();