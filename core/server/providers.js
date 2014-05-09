(function () {
    'use strict';

    var when    = require('when'),
        cfg     = require('nconf');

    module.exports = {

        postsProvider:       require('./services/postsprovider'),
        configProvider:     require('./services/configprovider'),
        usersProvider:       require('./services/usersprovider'),
        themesProvider:     require('./services/themesprovider'),
        imageProvider:      require('./services/imageprovider'),
        redirectsProvider:  require('./services/redirectsprovider'),
        pluginsService:      require('./services/pluginsservice'),

        init: function () {
            return when.join(
                this.pluginsService.init(),
                this.redirectsProvider.init(),
                this.postsProvider.init(),
                this.usersProvider.init(),
                this.themesProvider.init(),
                this.imageProvider.init()
            );
        }
    };

})();