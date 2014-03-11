'use strict';

var ctrlsModule = angular.module('pandaControllers', []);

ctrlsModule.controller('RootCtrl', ['$scope', 
    function ($scope) {
        $scope.pages = [];

        $scope.setPages = function (props) {
            var args = Array.prototype.slice.call(arguments);
            $scope.pages.splice(0, $scope.pages.length);

            console.info(args.length / 2)
            
            for (var i = 0; i <= args.length / 2; i+=2) {
                $scope.pages.push({id:args[i], name:args[i+1]});
            };
        };
    }
]);

ctrlsModule.controller('OverviewCtrl', ['$scope', 
    function ($scope) {
        $scope.setPages('overview', 'Overview');
    }
]);

ctrlsModule.controller('PostsCtrl', ['$scope', 'Posts',
    function ($scope, Posts) {
        $scope.setPages('posts', 'Posts', 'posts-all', 'All (20)');
        $scope.limit = 10;
        $scope.page = 1;

        $scope.$watch('limit', postViewSetChange);
        $scope.$watch('sortBy', postViewSetChange);

        loadPosts();

        $scope.setSortBy = function (sortBy, e) {
            e.preventDefault();
            $scope.sortBy = sortBy;
        }
        $scope.setLimit = function (limit, e) {
            e.preventDefault();
            $scope.limit = limit;
        };

        function postViewSetChange (old, update) {
            if (old === update) return;
            loadPosts();
        }

        function loadPosts () {
            $scope.posts = Posts.query({
                limit: $scope.limit, sortBy:$scope.sortBy
            });
        }
    }
]);

ctrlsModule.controller('PagesCtrl', ['$scope', '$interval', 
    function ($scope, $interval) {
        $scope.setPages('pages', 'Pages');
        $scope.publish = true;

        $interval(function () {
            $scope.publish = !$scope.publish;
        }, 20000);

        $scope.pages = [
            {title:'Post title', state:'Draft', user:{name:'User Name', website:'http://google.com'}, comments: 0, publishedAt: new Date()},
            {title:'Debug express', state:'Draft', user:{name:'User Name', website:'http://google.com'}, comments: 0, publishedAt: new Date()},
            {title:'Meta Keywords: Should we use them or not?', state:'Published', user:{name:'User Name', website:'http://google.com'}, comments: 0, publishedAt: new Date(2013, 5, 26, 3, 1)},
            {title:'Promise with node.js Loading file', state:'Published', user:{name:'User Name', website:'http://google.com'}, comments: 0, publishedAt: new Date(2013, 0, 20, 12, 33)}
        ];
    }
]);

ctrlsModule.controller('SettingsCtrl', ['$scope', 
    function ($scope) {
        $scope.setPages('settings', 'Settings');
    }
]);

ctrlsModule.controller('CommentsCtrl', ['$scope', 
    function ($scope) {
        $scope.setPages('comments', 'Comments');
    }
]);