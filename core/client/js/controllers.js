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

        $s.breakdown = Posts.postsCount(
            { page: false }, 
            function (breakdown) {
                $s.setBreadcrumb(1, { data: breakdown[$params.type] });
            }
        );

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

        function postViewSetChange (newValue, oldValue) {
            if (newValue !== oldValue) loadPosts();
        }

        function loadPosts () {
            Posts.query({
                limit: $s.limit, sortBy:$s.sortBy, type: $params.type, page: false
            }, function (posts) {
                $s.posts = posts;
            });
        }
    }
]);

ctrlsModule.controller('PagesCtrl', ['$scope', '$routeParams', 'Posts',
    function ($s, $params, Posts) {
        $s.setBreadcrumb('pages', $params.type);
        $s.pages = Posts.query({ page: true });
        $s.limit = 100;

        $s.breakdown = Posts.postsCount(
            { page: true }, 
            function (breakdown) {
                $s.setBreadcrumb(1, { data: breakdown[$params.type] });
            }
        );
    }
]);

ctrlsModule.controller('PostViewCtrl', ['$scope', 
    function ($s) {
        //;
    }
]);

ctrlsModule.controller('PostEditCtrl', ['$scope', '$filter', 
    function ($scope, $filter) {
        var unwatchTitle;
        var permalinks = {
            page: '/:slug.html',
            post: '/:year/:month/:day/:slug.html'
        }
        var tags = {
            ':slug': function () { return $scope.post.slug; },
            ':year': function () { return $scope.post.scheduledAt.getFullYear(); },
            ':month': function () { return _.str.lpad($scope.post.scheduledAt.getMonth(), 2, '0'); },
            ':day': function () { return _.str.lpad($scope.post.scheduledAt.getDate(), 2, '0'); }
        }

        $scope.allLabels = ['javascript', 'azure', 'Windows Azure', 'css', 'json', 'uuid'];

        // Initialize new post
        $scope.post = {
            scheduleOpt: 'auto',
            slugOpt: 'auto',
            page: false,
            scheduleDateTime: $filter('date')(new Date(), "yyyy-MM-ddTHH:mm"),
            scheduledAt: new Date(),
            labels: []
        };

        $scope.$watch('post.slug', setSlugFromTitle);
        $scope.$watch('post.slug', updatePermalinks);
        $scope.$watch('post.page', updatePermalinks);
        $scope.$watch('post.scheduledAt', updatePermalinks);
        $scope.$watch('post.scheduleDateTime', function (dateTime) {
            $scope.post.scheduledAt = new Date(dateTime);
        });
        $scope.$watch('post.slugOpt', function (opt) {
            if('auto' === opt) unwatchTitle = $scope.$watch('post.title', setSlugFromTitle);
            else if ('manual' === opt) unwatchTitle();
        });

        $scope.addLabel = function (label) {
            if (angular.isArray(label)) angular.forEach(label, add);
            else add(label);

            function add (label) {
                if (!label || ~$scope.post.labels.indexOf(label)) return;
                $scope.post.labels.push(label);
            }
        };

        $scope.delLabel = function (label) {
            var idx = $scope.post.labels.indexOf(label);
            if (~idx) $scope.post.labels.splice(idx, 1);
        }

        function updatePermalinks () {
            var $scope = arguments[2],
                url = ($scope.post.page) ? permalinks.page : permalinks.post;

            url = url.replace(/(:[a-z]+)/g, function (match) {
                if (match in tags) return tags[match]();
                return match;
            });

            $scope.permalink = url;
        }

        function setSlugFromTitle (text, oldText, $scope) {
            if (!text) $scope.post.slug = "";
            else $scope.post.slug = _.str.slugify(text);
        }
    }
]);

ctrlsModule.controller('SettingsCtrl', ['$scope', 
    function ($scope) {
        $scope.setBreadcrumb('settings');
    }
]);

ctrlsModule.controller('CommentsCtrl', ['$scope', 
    function ($scope) {
        $scope.setBreadcrumb('comments');
    }
]);