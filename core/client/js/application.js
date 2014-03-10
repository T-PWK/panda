'use strict';

angular.module('panda', ['ngRoute']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', { templateUrl:'/admin/partial/main', controller:MainCtrl })
      .otherwise({redirectTo: '/'});
}]);