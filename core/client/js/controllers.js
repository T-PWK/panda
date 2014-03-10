'use strict';

function RootCtrl ($scope) {
    $scope.pages = [];

    $scope.setPages = function (props) {
        var args = Array.prototype.slice.call(arguments);
        $scope.pages.splice(0, $scope.pages.length);

        console.info(args.length / 2)
        
        for (var i = 0; i <= args.length / 2; i+=2) {
            $scope.pages.push({id:args[i], name:args[i+1]});
        };
    }
}

RootCtrl.$inject = ['$scope'];

function OverviewCtrl ($scope)  {
    $scope.setPages('overview', 'Overview');
}

OverviewCtrl.$inject = ['$scope'];

function PostsCtrl ($scope) {
    $scope.setPages('posts', 'Posts', 'posts-all', 'All (20)');
}

PostsCtrl.$inject = ['$scope'];


function PagesCtrl ($scope) {
    $scope.setPages('pages', 'Pages');
}

PagesCtrl.$inject = ['$scope'];

function SettingsCtrl ($scope) {
    $scope.setPages('settings', 'Settings');
}

SettingsCtrl.$inject = ['$scope'];