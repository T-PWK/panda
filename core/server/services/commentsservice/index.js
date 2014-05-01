(function () {
    'use strict';

    var cfg = require('nconf'), CommentsService;

    switch (cfg.get('admin:comments:type')) {
        case 'disqus':
            CommentsService = require('./disquscomments');
            break;
    }

    module.exports = CommentsService;

})();
