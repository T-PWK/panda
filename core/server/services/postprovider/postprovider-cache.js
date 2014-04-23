(function () {
    "use strict";

    var inherits    = require('util').inherits,
        cfg         = require('nconf'),
        when        = require('when'),
        LRU         = require('lru-cache');


    module.exports = function (PostProvider) {
        function CachePostProvider () {
            this.cache = new LRU(cfg.get('cache:posts:options'));
        }

        inherits(CachePostProvider, PostProvider);

        CachePostProvider.prototype.labelsInfo = function (options) {
            var key = (options && options.live) ? ':labels:live' : ':labels:all';
            return cachedValue.call(this, this, key, CachePostProvider.super_.prototype.labelsInfo, options);
        };

        CachePostProvider.prototype.archiveInfo = function (options) {
            return cachedValue.call(this, this, ':archive', CachePostProvider.super_.prototype.archiveInfo, options);
        };

        CachePostProvider.prototype.postStatsInfo = function (options) {
            var key = ':stats';
            if ('undefined' !== typeof options.page) {
                key += options.page ? ':page': ':post';
            }

            return cachedValue.call(this, this, key, CachePostProvider.super_.prototype.postStatsInfo, options);
        };

        CachePostProvider.prototype.create = function (properties, options) {
            this.cache.reset();
            return CachePostProvider.super_.prototype.create(properties, options);
        };

        CachePostProvider.prototype.update = function (id, properties, options) {
            this.cache.reset();
            return CachePostProvider.super_.prototype.update(id, properties, options);
        };

        CachePostProvider.prototype.remove = function (id) {
            this.cache.reset();
            return CachePostProvider.super_.prototype.remove(id);
        };

        return CachePostProvider;
    };

    function cachedValue (self, key, fn) {
        var cache   = self.cache,
            info    = cache.get(key),
            args    = Array.prototype.slice.call(arguments);

        if (info) {
            return when.resolve(info);
        } else {
            return when.resolve(fn.apply(self, args.slice(3)))
                .tap(function (info) {
                    cache.set(key, info);
                });
        }
    }

}());