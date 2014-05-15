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
    };

    ImageProvider.prototype.init = function () {
        return when.resolve();
    };

    ImageProvider.prototype.all = function () {
        var listBlobs = node.lift(this.blob.listBlobs.bind(this.blob)), host = this.options.host;

        return listBlobs(this.options.container).spread(function (blobs) {
            return blobs.map(blobMapping);
        });

        function blobMapping(blob) {
            var blobUrl = url.parse(blob.url);
            blobUrl.host = host || blobUrl.host;
            blobUrl.protocol = 'http:';

            return {
                name: blob.name,
                url: url.format(blobUrl),
                size: blob.properties['content-length']
            };
        }
    };

    ImageProvider.prototype.createFromStream = function(name, size, part){

        var options = {
            contentTypeHeader: mime.lookup(name)
        };

        console.info('name', name, options);

        this.blob.createBlockBlobFromStream(this.options.container, name, part, size, options, function(error) {
            if (error) {
                console.info('error', error);
            } else {
                console.info('File %s uploaded to Azure Blob successfully', name);
            }
        });
    };

    module.exports = ImageProvider;

})();