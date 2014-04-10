(function () {
    'use strict';

    angular.module('panda', ['ngRoute', 'ngResource', 'panda.controllers', 'panda.utils']).
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
                .when('/themes', { templateUrl: 'themes', controller: 'ThemesCtrl' })
                .otherwise({ redirectTo: '/' });
        }])
        .factory('Users', ['$resource', function($resource) {
            return $resource('/api/v1/user/:type', {type: '@type'},
                {
                    update: { method: 'PUT', params: { type: 'basic' } },
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
            return $resource('/api/v1/config/redirects/:id',
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
        .factory('Themes', ['$resource', function ($resource) {
            return $resource('/api/v1/themes/:type/:id',
                { id: '@id' },
                {
                    update: { method: 'PUT', params: { type: '@type'} }
                }
            );
        }])
        .factory('MarkdownConverter', [function () {
            marked.setOptions({
                renderer: new marked.Renderer(),
                gfm: true,
                tables: true,
                breaks: false,
                pedantic: false,
                sanitize: true,
                smartLists: true,
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
                return input.slice(+start);
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
            status: {
                'D': 'Draft',
                'S': 'Scheduled',
                'A': 'Live'
            },
            pageNames: {
                basic: 'Basic',
                overview: 'Overview',
                posts: 'Posts',
                pages: 'Pages',
                comments: 'Comments',
                settings: 'Settings',
                all: 'All',
                scheduled: 'Scheduled',
                draft: 'Draft',
                live: 'Published',
                users: 'Users',
                themes: 'Themes',
                redirects: 'Redirects',
                'new': 'New',
                ips: 'IP Restrictions'
            }
        });
}());