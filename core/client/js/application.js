'use strict';

angular.module('panda', ['ngRoute']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', { templateUrl:'/admin/partial/overview', controller:OverviewCtrl })
      .when('/posts', { templateUrl:'/admin/partial/posts', controller:PostsCtrl })
      .when('/posts/all', { templateUrl:'/admin/partial/posts', controller:PostsCtrl })
      .when('/posts/scheduled', { templateUrl:'/admin/partial/posts', controller:PostsCtrl })
      .when('/posts/draft', { templateUrl:'/admin/partial/posts', controller:PostsCtrl })
      .when('/posts/published', { templateUrl:'/admin/partial/posts', controller:PostsCtrl })
      .when('/pages', { templateUrl:'/admin/partial/pages', controller:PagesCtrl })
      .when('/settings', { templateUrl:'/admin/partial/settings', controller:SettingsCtrl })
      .otherwise({redirectTo: '/'});
}]);