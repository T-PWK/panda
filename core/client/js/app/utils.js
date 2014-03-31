(function () {
    'use strict';

    function Selection() {
        this.items = {};
        this.size = 0;
        this.all = false;
    }
    Selection.prototype = {
        isEmpty: function () {
            return this.howMany() === 0;
        },
        howMany: function () {
            return _.size(this.items);
        },
        has: function (item) {
            return _.has(this.items, item);
        },
        add: function (item) {
            if (!this.has(item)) { this.items[item] = null; }
        },
        remove: function (item) {
            delete this.items[item];
            this.all = false;
        },
        empty: function () {
            this.all = false;
            this.items = {};
        },
        toggle: function (item) {
            if (this.has(item)) { this.remove(item); }
            else { this.add(item); }
        }
    };

    function Pagination(options) {
        this._items = options.items || 0;
        this._current = 1;
        this.pageSize = options.pageSize || 10;
        this.pages = Math.ceil(this._items / this.pageSize) || 1;
        this.hasPrev = this._current > 1;
        this.hasNext = this._current < this.pages;
        this.firstItem = 0;
        this.from = 0;
        this.to = 0;
    }

    Pagination.prototype.next = function () {
        if (this.hasNext) {
            this.current++;
        }
    };

    Pagination.prototype.prev = function () {
        if (this.hasPrev) {
            this.current--;
        }
    };

    Object.defineProperties(Pagination.prototype, {
        pageSize: {
            enumerable: true,
            set: function (value) {
                this.pages = Math.ceil(this._items / value) || 1;
                this._pageSize = value;
                this.current = 1;
            },
            get: function () { return this._pageSize; }
        },
        items: {
            enumerable: true,
            set: function (value) {
                value = angular.isArray(value) ? value.length : value;
                this._items = value;
                this.pages = Math.ceil(this._items / this.pageSize) || 1;
                this.current = this.current;
            },
            get: function () { return this._items; }
        },
        current: {
            enumerable: true,
            set: function (value) {
                this._current = value;
                this.hasPrev = value > 1;
                this.hasNext = value < this.pages;
                this.firstItem = (value-1)*this.pageSize;
                this.from = this.firstItem + 1;
                this.to = Math.min(this.from + this.pageSize - 1, this.items);
            },
            get: function () { return this._current; }
        },
        pageRange: {
            enumerable: true,
            get: function () { return _.range(1, this.pages+1); }
        }
    });

    var module = angular.module('panda.utils', []);

    module.factory('Utils', function( ) {
        return {
            selection: function() {
                return new Selection();
            },
            pagination: function(options) {
                return new Pagination(options || {});
            }
        }
    });

})();