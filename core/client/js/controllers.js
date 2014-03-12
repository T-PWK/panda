'use strict';

var ctrlsModule = angular.module('pandaControllers', []);

ctrlsModule.controller('RootCtrl', ['$scope', 'Config',
    function ($scope, Config) {
        $scope.breadcrumb = [];


        $scope.setBreadcrumb = function (props) {
            var args = Array.prototype.slice.call(arguments);

            if (angular.isNumber(args[0])) {
                updateItem(args);
            } else {
                updateBreadcrumb(args);
                
            }
        };

        function updateItem (args) {
            if (angular.isObject(args[1])) {
                angular.extend($scope.breadcrumb[args[0]], args[1]);
            } 
            else {
                $scope.breadcrumb[args[0]].display = args[1];
            }
        }

        function updateBreadcrumb (args) {
            $scope.breadcrumb = [];
            angular.forEach(args, function (id) {
                if (angular.isString(id)) {
                    this.push({ id: id, display: Config.pageNames[id] || id });
                }
                else if (angular.isObject(id)) {
                    this.push(angular.copy(id));
                }
            }, $scope.breadcrumb);
        }
    }
]);

ctrlsModule.controller('OverviewCtrl', ['$scope', 
    function ($s) {
        $s.setBreadcrumb('overview');
    }
]);

ctrlsModule.controller('PostsCtrl', ['$scope', '$routeParams', 'Posts', 'Config',
    function ($s, $params, Posts, Config) {
        $s.limit = 10;
        $s.page = 1;
        $s.type = $params.type
        $s.setBreadcrumb('posts', $params.type);

        $s.breakdown = Posts.countByPublishedAt(function (breakdown) {
            $s.setBreadcrumb(1, { data: breakdown[$params.type] });
        });

        $s.$watch('limit', postViewSetChange);
        $s.$watch('sortBy', postViewSetChange);

        loadPosts();

        $s.status = function (post) {
            return Config.status[$s.statusCode(post)];
        }

        $s.statusCode = function (post) {
            var date = post.publishedAt;
            if (!angular.isDefined(date)) return 'D';

            // Convert string to date            
            if (!angular.isDate(date)) date = new Date(date);

            if (date > Date.now()) return 'S';
            else return 'A';
        }

        $s.setSortBy = function (sortBy, e) {
            e.preventDefault();
            $s.sortBy = sortBy;
        }
        $s.setLimit = function (limit, e) {
            e.preventDefault();
            $s.limit = limit;
        };

        function postViewSetChange (old, update) {
            if (old === update) return;
            loadPosts();
        }

        function loadPosts () {
            $s.posts = Posts.query({
                limit: $s.limit, sortBy:$s.sortBy, type: $params.type
            });
        }
    }
]);

ctrlsModule.controller('PagesCtrl', ['$scope', '$routeParams', 'Pages',
    function ($s, $params, Pages) {
        $s.setBreadcrumb('pages', $params.type);
        $s.pages = Pages.query();
        $s.limit = 100;

        $s.breakdown = Pages.countByPublishedAt(function (breakdown) {
            $s.setBreadcrumb(1, { data: breakdown[$params.type] });
        });
    }
]);

ctrlsModule.controller('PostViewCtrl', ['$scope', 
    function ($s) {
        //;
    }
]);

ctrlsModule.controller('PostEditCtrl', ['$scope', 
    function ($s) {
        var postTitleUnwatch;

        // Initialize new post
        $s.post = {
            scheduleOpt: 'auto',
            slugOpt: 'auto',
            page: false
        };

        $s.$watch('post.slugOpt', function (opt) {
            switch(opt) {
                case 'auto': 
                    postTitleUnwatch = $s.$watch('post.title', updateSlugFromTitle);
                    break;
                case 'manual':
                    postTitleUnwatch();
                    break;
                default:
            }
        });

        function updateSlugFromTitle (value) {
            if (!value) return;
            $s.post.slug = S(value).slugify().s;
        }
    }
]);

ctrlsModule.controller('SettingsCtrl', ['$scope', 
    function ($s) {
        $s.setBreadcrumb('settings');
    }
]);

ctrlsModule.controller('CommentsCtrl', ['$scope', 
    function ($scope) {
        $scope.setBreadcrumb('comments');
    }
]);