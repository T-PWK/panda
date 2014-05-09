(function () {
    'use strict';

    var cfg = require('nconf'), ImageProvider;

    switch (cfg.get('admin:images:type')) {
        case 'azure':
            ImageProvider = require('./imageprovider-azure');
            break;
        case 'disk':
            ImageProvider = require('./imageprovider-disk');
            break;
    }

    module.exports = new ImageProvider(cfg.get('admin:images'));
})();