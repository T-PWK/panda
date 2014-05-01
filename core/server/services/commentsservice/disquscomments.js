(function () {
    'use strict';

    var when    = require('when'),
        node    = require('when/node'),
        cfg     = require('nconf'),
        _       = require('underscore');

    var CommentsService = function () {};

    CommentsService.prototype.init = function () {
        return when.resolve();
    };

    module.exports = CommentsService;

})();