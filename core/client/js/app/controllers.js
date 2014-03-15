(function () {
    'use strict';

    var ctrlsModule = angular.module('pandaControllers', []);

    ctrlsModule.controller('RootCtrl', ['$scope', 'Config',
        function ($scope, Config) {
            $scope.loading = false;
            $scope.breadcrumb = [];

            $scope.setLoading = function (loading) {
                $scope.loading = loading;
            };

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
        function ($scope, $params, Posts, Config) {
            $scope.setBreadcrumb('posts', $params.type);
            $scope.type = $params.type;
            $scope.pagination = {
                limit: 10, pages: [], page: 1, total: 0, 
                nextPage: true, prevPage: true,
                posts: { from: 1, to: 10 }
            };
            $scope.selection = { keys: {}, all: false };
            $scope.postsCount = Posts.postsCount(
                { page: false }, 
                function (postsCount) {
                    $scope.pagination.total = postsCount[$params.type];
                    $scope.total = postsCount[$params.type];
                    $scope.setBreadcrumb(1, { data: postsCount[$params.type] });
                }
            );

            // Clear posts selection
            $scope.$watch('pagination.limit', clearSelection);
            $scope.$watch('pagination.page', clearSelection);
            $scope.$watch('sortBy', clearSelection);

            // Update posts view
            $scope.$watch('pagination.limit', postViewSetChange);
            $scope.$watch('pagination.page', postViewSetChange);
            $scope.$watch('sortBy', postViewSetChange);

            // Update pagination
            $scope.$watch('posts', updatePagination);

            loadPosts();

            $scope.statusText = function (post) {
                return Config.status[$scope.status(post)];
            };

            $scope.select = function (id) {
                if ($scope.selection.keys[id]) removeSelection(id);
                else addSelection(id);
            };

            $scope.selectAll = function () {
                var sel = $scope.selection;
                if (sel.all) clearSelection();
                else {
                    angular.forEach($scope.posts, function (post) {
                        addSelection(post._id);
                    });
                    $scope.selection.all = true;
                }
            };

            $scope.status = function (post) {
                var date = post.publishedAt;
                if (!angular.isDefined(date)) return 'D';
                if (!angular.isDate(date)) date = new Date(date); // Convert string to date 
                if (date > Date.now()) return 'S';
                else return 'A';
            };

            $scope.setSortBy = function (sortBy, e) {
                e.preventDefault();
                $scope.sortBy = sortBy;
                $scope.pagination.page = 1;
            };

            $scope.setLimit = function (limit, e) {
                e.preventDefault();
                $scope.pagination.limit = limit;
                $scope.pagination.page = 1;
            };

            $scope.setPage = function (num) {
                $scope.pagination.page = num;
            };

            function clearSelection () {
                $scope.selection.keys = {};
                $scope.selection.all = false;
            }

            function addSelection (id) {
                $scope.selection.keys[id] = true;
            }

            function removeSelection (id) {
                delete $scope.selection.keys[id];
                $scope.selection.all = false;
            }

            function updatePagination () {
                var pg = $scope.pagination, 
                    pages = Math.ceil((pg.total || 0) / pg.limit);
                    
                pg.pages = [];
                for(var i = 1; i <= pages; i++) pg.pages.push(i);

                pg.posts.from = pg.limit * (pg.page - 1) + 1;
                pg.posts.to = Math.min(pg.posts.from + pg.limit - 1, pg.total);

                pg.hasNext = pg.page < pages;
                pg.hasPrev = pg.page > 1;
            }

            function postViewSetChange (newValue, oldValue) {
                if (newValue !== oldValue) loadPosts();
            }

            function loadPosts () {
                $scope.setLoading(true);
                var pg = $scope.pagination, skip = (pg.page - 1) * pg.limit;

                Posts.query({
                    limit: $scope.pagination.limit, 
                    skip: skip,
                    sortBy: $scope.sortBy, 
                    type: $params.type, 
                    page: false
                }, function (posts) {
                    $scope.setLoading(false);
                    $scope.posts = posts;
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

    ctrlsModule.controller('PostEditCtrl', ['$scope', '$filter', 'Labels',
        function ($scope, $filter, Labels) {
            $scope.setBreadcrumb('postedit');
            var unwatchTitle;
            var permalinks = {
                page: '/:slug.html',
                post: '/:year/:month/:day/:slug.html'
            };
            var tags = {
                ':slug': function () { return $scope.post.slug || ':slug:'; },
                ':year': function () { return $scope.post.scheduledAt.getFullYear(); },
                ':month': function () { return _.str.lpad($scope.post.scheduledAt.getMonth(), 2, '0'); },
                ':day': function () { return _.str.lpad($scope.post.scheduledAt.getDate(), 2, '0'); }
            };

            $scope.allLabels = Labels.query();

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
            };

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

    ctrlsModule.controller('UsersCtrl', ['$scope', 
        function ($scope) {
            $scope.setBreadcrumb('users');
        }
    ]);

    ctrlsModule.controller('ThemesCtrl', ['$scope', 
        function ($scope) {
            $scope.setBreadcrumb('themes');
        }
    ]);
}());
