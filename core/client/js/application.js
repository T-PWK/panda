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
            .otherwise({ redirectTo: '/' });
    }])
    .factory('Posts', ['$resource', function ($resource) {
        return $resource('/api/v1/posts/:id:info/:kind',
            {id:'@id', info:'@info', type:'@kind'},
            {
                postsCount: { method: 'GET', params: { info: 'count' }}
            }
        );
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
    .value('Config', {
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
            published: 'Published'
        }
    });