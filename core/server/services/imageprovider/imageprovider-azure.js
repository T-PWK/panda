// ImageProvider using Azure blob

(function () {
    'use strict';

    var when    = require('when'),
        node    = require('when/node'),
        url     = require('url'),
        mime    = require('mime'),
        _       = require('lodash'),
        azure   = require('azure');

    var ImageProvider = function (options) {
        this.options = options;
        this.blob = azure.createBlobService(options.account, options.key);
        this.deleteBlob = node.lift(this.blob.deleteBlob.bind(this.blob));
        this.listBlobs = node.lift(this.blob.listBlobs.bind(this.blob));
    };

    ImageProvider.prototype.init = function () {
        return when.resolve();
    };

    ImageProvider.prototype.all = function () {
        var host = this.options.host;

        return this
            .listBlobs(this.options.container)
            .spread(function (blobs) {
                return blobs.map(blobMapping);
            });

        function blobMapping(blob) {
            var blobUrl = url.parse(blob.url);
            blobUrl.host = host || blobUrl.host;
            blobUrl.protocol = 'http:';

            return {
                name: blob.name,
                url: url.format(blobUrl),
                size: +blob.properties['content-length'],
                contentType: blob.properties['content-type']
            };
        }
    };

    ImageProvider.prototype.remove = function (id) {
        return this.deleteBlob(this.options.container, id);
    };

    ImageProvider.prototype.createFromFile = function (file) {
        var createBlockBlobFromFile = node.lift(this.blob.createBlockBlobFromFile.bind(this.blob)),
            options = { contentType: mime.lookup(file.originalFilename) };

        return createBlockBlobFromFile(this.options.container, file.originalFilename, file.path, options);
    };

    module.exports = ImageProvider;

})();