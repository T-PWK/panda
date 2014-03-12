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

        $scope.status = function (post) {
            if (!post.publishedAt) return 'Draft';
            else if (post.publishedAt > Date.now()) return 'Scheduled';
        }

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

ctrlsModule.controller('PagesCtrl', ['$scope', 'Pages',
    function ($scope, Pages) {
        $scope.setPages('pages', 'Pages');
        $scope.publish = true;
        $scope.pages = Pages.query();
        $scope.limit = 100;
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