(function () {
    'use strict';

    angular.module('panda', ['ngRoute', 'ngResource', 'pandaControllers']).
        config(['$routeProvider', function($routeProvider) {
            $routeProvider
                .when('/', { templateUrl:'/admin/partial/overview', controller:'OverviewCtrl' })
                .when('/posts', { redirectTo: '/posts/all' })
                .when('/posts/:type?', { templateUrl:'/admin/partial/posts', controller:'PostsCtrl' })
                .when('/pages', { redirectTo: '/pages/all' })
                .when('/pages/:type?', { templateUrl:'/admin/partial/pages', controller:'PagesCtrl' })
                .when('/posts/:id/view', { templateUrl: '/admin/partial/viewpost', controller: 'PostViewCtrl' })
                .when('/posts/:id/edit', { templateUrl: '/admin/partial/editpost', controller: 'PostEditCtrl' })
                .when('/comments', { templateUrl:'/admin/partial/comments', controller:'CommentsCtrl' })
                .when('/settings', { templateUrl:'/admin/partial/settings', controller:'SettingsCtrl' })
                .when('/settings/redirects', { templateUrl:'/admin/partial/redirects' })
                .when('/users', { templateUrl:'/admin/partial/users', controller:'UsersCtrl' })
                .when('/themes', { templateUrl:'/admin/partial/themes', controller:'ThemesCtrl' })
                .otherwise({ redirectTo: '/' });
        }])
        .factory('Posts', ['$resource', function ($resource) {
            return $resource('/api/v1/posts/:id',
                {id:'@id', info:'@info', type:'@kind'},
                {
                    postsCount: { method: 'GET', params: { info: 'count' }}
                }
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
                { id:'@id' },
                {
                    update: { method: 'PUT', params: { type: '@type'} }
                }
            );
        }])
        .factory('MarkdownConverter', [function () {
            return new Showdown.converter();
        }])
        .filter('moment', [function () {
            return function (date, format) {
                return moment(date).format(format || 'L');
            }
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
        .value('ConfigValues', {
            status: {
                'D': 'Draft',
                'S': 'Scheduled',
                'A': 'Active'
            },
            pageNames: {
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
                redirects: 'Redirections'
            }
        });
}());