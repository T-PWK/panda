(function () {
    'use strict';

    var pageNames = {
            basic:      'Basic',
            overview:   'Overview',
            posts:      'Posts',
            pages:      'Pages',
            comments:   'Comments',
            settings:   'Settings',
            all:        'All',
            scheduled:  'Scheduled',
            draft:      'Draft',
            live:       'Published',
            users:      'Users',
            themes:     'Themes',
            redirects:  'Redirects',
            'new':      'New',
            ips:        'IP Restrictions',
            images:     'Images',
            upload:     'Upload',
            browse:     'Browse',
            plugins:    'Plugins'
        },
        status = {
            'D': 'Draft',
            'S': 'Scheduled',
            'A': 'Live'
        };

    angular.module('panda', ['ngRoute', 'ngResource', 'panda.controllers', 'panda.utils', 'angularFileUpload', 'ui.bootstrap']).
        config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/', { templateUrl: 'overview', controller: 'OverviewCtrl' })
                .when('/posts', { redirectTo: '/posts/all' })
                .when('/posts/new', { templateUrl: 'editpost', controller: 'NewPostCtrl' })
                .when('/posts/:type?', { templateUrl: 'posts', controller: 'PostsCtrl' })
                .when('/pages', { redirectTo: '/pages/all' })
                .when('/pages/:type?', { templateUrl: 'posts', controller: 'PagesCtrl' })
                .when('/posts/:id/edit', { templateUrl: 'editpost', controller: 'PostEditCtrl' })
                .when('/comments', { templateUrl: 'comments', controller: 'CommentsCtrl' })
                .when('/settings', { redirectTo: '/settings/basic' })
                .when('/settings/basic', { templateUrl: 'settings', controller: 'SettingsCtrl' })
                .when('/settings/ips', { templateUrl: 'ips', controller: 'IpsCtrl' })
                .when('/settings/redirects', { templateUrl: 'redirects' })
                .when('/users', { templateUrl: 'users', controller: 'UsersCtrl' })
                .when('/plugins', { templateUrl: 'plugins', controller: 'PluginsCtrl' })
                .when('/themes', { templateUrl: 'themes', controller: 'ThemesCtrl' })
                .when('/images/upload', { templateUrl: 'upload-images', controller: 'ImgCtrl' })
                .when('/images/browse', { templateUrl: 'browse-images', controller: 'ImgCtrl' })
                .otherwise({ redirectTo: '/' });

            NProgress.configure({ speed: 200, trickleRate: 0.05, trickleSpeed: 250  });
        }])
        .factory('Users', ['$resource', function($resource) {
            return $resource('/api/v1/user/:type', {type: '@type'},
                {
                    update:         { method: 'PUT', params: { type: 'basic' } },
                    updatePassword: { method: 'PUT', params: { type: 'password' } }
                }
            );
        }])
        .factory('Settings', ['$resource', function ($resource) {
            return $resource('/api/v1/settings/:id', { id:'@id' });
        }])
        .factory('Ips', ['$resource', function ($resource) {
            return $resource('/api/v1/ips/:type', { type:'@type' });
        }])
        .factory('Posts', ['$resource', function ($resource) {
            return $resource('/api/v1/posts/:id',
                { id: '@id' },
                { create: { method: 'POST' }, update: { method: 'PUT' } }
            );
        }])
        .factory('Redirects', ['$resource', function ($resource) {
            return $resource('/api/v1/redirects/:id',
                { id: '@id' },
                { create: { method: 'POST' }, update: { method: 'PUT' } }
            );
        }])
        .factory('PostsInfo', ['$resource', function ($resource) {
            return $resource('/api/v1/posts/infos/:id', {id: '@id'});
        }])
        .factory('Labels', ['$resource', function ($resource) {
            return $resource('/api/v1/labels');
        }])
        .factory('Images', ['$resource', function ($resource) {
            return $resource('/api/v1/images');
        }])
        .factory('Plugins', ['$resource', function ($resource) {
            return $resource('/api/v1/plugins/:id',
                {id: '@id'},
                {
                    start: { method: 'POST', params: { op: 'start' } },
                    stop: { method: 'POST', params: { op: 'stop' } }
                }
            );
        }])
        .factory('Themes', ['$resource', function ($resource) {
            return $resource('/api/v1/themes/:type/:id',
                { id: '@id' },
                { update: { method: 'PUT', params: { type: '@type'} } }
            );
        }])
        .factory('MarkdownConverter', [function () {
            marked.setOptions({
                renderer:    new marked.Renderer(),
                gfm:         true,
                tables:      true,
                breaks:      false,
                pedantic:    false,
                sanitize:    true,
                smartLists:  true,
                smartypants: false
            });
            return {
                makeHtml: function (value) {
                    return marked(value);
                }
            };
        }])
        .filter('moment', [function () {
            return function (date, format) {
                return moment(date).format(format || 'L');
            };
        }])
        .filter('startFrom', [function () {
            return function (input, start) {
                return input ? input.slice(+start) : input;
            };
        }])
        .filter('status', [function () {
            return function (post) {
                if (!post.published) return 'D';

                var date = post.publishedAt;
                if (!angular.isDate(date)) {
                    date = new Date(date);
                }
                if (date > _.now()) { // Convert string to date
                    return 'S';
                }
                return 'A';
            };
        }])
        .filter('statusText', ['statusFilter', function(statusFilter){
            return function(post) {
                return status[statusFilter(post)];
            };
        }])
        .filter('name', [function(){
            return function (name) {
                return pageNames[name];
            };
        }])
        .filter('unsafe', ['$sce', function ($sce) {
            return function (val) {
                return $sce.trustAsHtml(val);
            };
        }])
        .directive('ngEnter', function() {
            return function(scope, element, attrs) {
                element.bind("keydown keypress", function(event) {
                    if(event.which === 13) {
                        scope.$apply(function(){
                            scope.$eval(attrs.ngEnter, {'event': event});
                        });
                        event.preventDefault();
                    }
                });
            };
        })
        .directive('ngKeyAction', function() {
            return function(scope, element, attrs) {
                element.bind("keydown keypress", function(event) {
                    var actions = scope.$eval(attrs.ngKeyAction);
                    if (event.which in actions) {
                        scope.$apply(function(){
                            scope.$eval(attrs[actions[event.which]], {'event': event});
                        });
                        event.preventDefault();
                    }
                });
            };
        })
        .value('Constants', {
            status: status,
            pageNames: pageNames
        });
}());