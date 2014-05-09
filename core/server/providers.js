(function () {
    'use strict';

    var when    = require('when'),
        cfg     = require('nconf');

    module.exports = {

        postProvider:       require('./services/postprovider'),
        configProvider:     require('./services/configprovider'),
        userProvider:       require('./services/userprovider'),
        themesProvider:     require('./services/themesprovider'),
        imageProvider:      require('./services/imageprovider'),
        redirectsProvider:  require('./services/redirectsprovider'),
        pluginService:      require('./services/pluginservice'),

        init: function () {
            return when.join(
                this.pluginService.init(),
                this.redirectsProvider.init(),
                this.postProvider.init(),
                this.userProvider.init(),
                this.themesProvider.init(),
                this.imageProvider.init()
            );
        }
    };

})();