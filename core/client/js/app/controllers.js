(function () {
    'use strict';

    var isDefined   = angular.isDefined,
        bind        = angular.bind,
        forEach     = angular.forEach,
        isObject    = angular.isObject,
        copy        = angular.copy,
        isArray     = angular.isArray;

    function Container() {
        this.items = {};
        this.size = 0;
    }
    Container.prototype = {
        isEmpty: function () {
            return this.howMany() === 0;
        },
        howMany: function () {
            return _.size(this.items);
        },
        has: function (item) {
            return _.has(this.items, item);
        },
        add: function (item) {
            if (!this.has(item)) { this.items[item] = null; }
        },
        remove: function (item) {
            delete this.items[item];
        },
        empty: function () {
            this.items = {};
        },
        toggle: function (item) {
            if (this.has(item)) { this.remove(item); }
            else { this.add(item); }
        }
    };

    function Pagination(options) {
        options = options || {};
        this._items = options.items || 0;
        this._current = 1;
        this.pageSize = options.pageSize || 10;
        this.pages = Math.ceil(this._items / this.pageSize) || 1;
        this.hasPrev = this._current > 1;
        this.hasNext = this._current < this.pages;
        this.firstItem = 0;
    }

    Pagination.prototype.next = function () {
        if (this.hasNext) {
            this.current++;
        }
    };

    Pagination.prototype.prev = function () {
        if (this.hasPrev) {
            this.current--;
        }
    };

    Object.defineProperties(Pagination.prototype, {
        items: {
            enumerable: true,
            set: function (value) {
                value = isArray(value) ? value.length : value;
                this._items = value;
                this.pages = Math.ceil(this._items / this.pageSize) || 1;
                this.current = this.current;
            },
            get: function () { return this._items; }
        },
        current: {
            enumerable: true,
            set: function (value) {
                this._current = value;
                this.hasPrev = value > 1;
                this.hasNext = value < this.pages;
                this.firstItem = (value-1)*this.pageSize;
            },
            get: function () { return this._current; }
        },
        pageRange: {
            enumerable: true,
            get: function () { return _.range(1, this.pages+1); }
        }
    });

    var ctrlsModule = angular.module('pandaControllers', []);

    ctrlsModule.controller('RootCtrl', ['$scope', 'Constants',
        function ($scope, Config) {
            $scope.loading = false;
            $scope.breadcrumb = [];
            $scope.postsCount = {};

            $scope.setLoading = function (loading) {
                $scope.loading = (loading === true) ? 'Loading' : loading;
            };

            $scope.setBreadcrumb = function (props) {
                var args = Array.prototype.slice.call(arguments);

                if (angular.isNumber(args[0])) {
                    updateCrumbItem(args);
                } else {
                    updateBreadcrumb(args);
                }
            };

            $scope.setPostCounts = function (counts) {
                $scope.postsCount = counts;
            };

            function updateCrumbItem (args) {
                if (isObject(args[1])) {
                    angular.extend($scope.breadcrumb[args[0]], args[1]);
                } 
                else {
                    $scope.breadcrumb[args[0]].display = args[1];
                }
            }

            function updateBreadcrumb (args) {
                $scope.breadcrumb = [];
                forEach(args, function (id) {
                    if (angular.isString(id)) {
                        this.push({ id: id, display: Config.pageNames[id] || id });
                    }
                    else if (isObject(id)) {
                        this.push(copy(id));
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

    ctrlsModule.controller('PostsCtrl', ['$scope', '$routeParams', 'Posts', 'PostsInfo', 'Constants',
        function ($scope, $params, Posts, Info, Config) {
            $scope.setBreadcrumb('posts', $params.type);
            $scope.type = $params.type;
            $scope.pagination = {
                limit: 10,
                pages: [],
                page: 1,
                total: 0,
                nextPage: true,
                prevPage: true,
                posts: { from: 1, to: 10 }
            };
            $scope.selection = { keys: {}, all: false };

            loadPostsCount();

            $scope.time = function (date) {
                return moment(date).format('LLLL');
            };

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
                if (sel.all) {
                    clearSelection();
                } else {
                    forEach($scope.posts, function (post) {
                        addSelection(post.id);
                    });
                    $scope.selection.all = true;
                }
            };

            $scope.status = function (post) {
                var date = post.publishedAt;
                if (!isDefined(date)) {
                    return 'D';
                }
                if (!angular.isDate(date)) {
                    date = new Date(date);
                }
                if (date > Date.now()) { // Convert string to date
                    return 'S';
                }
                return 'A';
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

            function loadPostsCount () {
                if (!$scope.postsCount.all) {
                    Info.get({id: 'count', page: false }, function (counts) {
                        $scope.setPostCounts(counts);
                        updatePostsCountInfo();
                    });
                } else {
                    updatePostsCountInfo();
                }
            }

            function updatePostsCountInfo() {
                var qty = $scope.postsCount[$params.type];
                $scope.setBreadcrumb(1, { data: qty });
                $scope.total = qty;
                $scope.pagination.total = qty;
            }

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
                for(var i = 1; i <= pages; i++) {
                    pg.pages.push(i);
                }

                pg.posts.from = pg.limit * (pg.page - 1) + 1;
                pg.posts.to = Math.min(pg.posts.from + pg.limit - 1, pg.total);

                pg.hasNext = pg.page < pages;
                pg.hasPrev = pg.page > 1;
            }

            function postViewSetChange (newValue, oldValue) {
                if (newValue !== oldValue) {
                    loadPosts();
                }
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

    ctrlsModule.controller('PagesCtrl', ['$scope', '$routeParams', 'Posts', 'PostsInfo',
        function ($scope, $params, Posts, Info) {
            $scope.setBreadcrumb('pages', $params.type);
            $scope.pages = Posts.query({ page: true });
            $scope.limit = 100;
            $scope.breakdown =  Info.get({id: 'count', page: false })
                .$promise.then(function (breakdown) {
                    $scope.setBreadcrumb(1, { data: breakdown[$params.type] });
                });
        }
    ]);

    ctrlsModule.controller('LabelsCtrl', ['$scope', 'Labels',
        function ($scope, Labels) {
            $scope.allLabels = Labels.query();

            $scope.addLabel = function (label) {
                if (angular.isArray(label)) {
                    forEach(label, add);
                }
                else { add(label); }

                function add (label) {
                    var labels = $scope.post.labels || ($scope.post.labels = []);

                    if (!label || ~_.indexOf(labels, label)) {
                        return;
                    }

                    labels.push(label);
                }
            };

            $scope.delLabel = function (label) {
                var labels = $scope.post.labels || ($scope.post.labels = []),
                    idx = labels.indexOf(label);

                if (~idx) labels.splice(idx, 1);
            };
    }]);

    ctrlsModule.controller('ScheduleCtrl', ['$scope',
        function ($scope) {
            $scope.$watch('post.scheduleOpt', function (opt) {
                if ('undefined' === typeof opt) {
                    return;
                }
                if (opt) {
                    $scope.opt.customSchedule = moment().format('lll');
                }
            });

            $scope.$watch('opt.customSchedule', function (value) {
                var date = moment(value);

                $scope.opt.customScheduleValid = date.isValid();
                if (date.isValid()) {
                    $scope.post.scheduledAt = date.toDate();
                }
            });
        }
    ]);

    ctrlsModule.controller('SlugCtrl', ['$scope',
        function ($scope) {
            var unwatchTitle;

            $scope.$watch('post.slugOpt', function (opt) {
                if(opt) {
                    unwatchTitle = $scope.$watch('post.title', setSlugFromTitle);
                } else {
                    unwatchTitle();
                }
            });

            function setSlugFromTitle (text) {
                if (!text) {
                    $scope.post.slug = '';
                } else {
                    $scope.post.slug = _.str.slugify(text);
                }
            }
        }
    ]);


    ctrlsModule.controller('NewPostCtrl', ['$scope', '$location', 'Posts',
        function ($scope, $location, Posts) {
            $scope.setBreadcrumb('newpost');
            $scope.opt = { customDate: '', editor: true, create: true };
            $scope.post = { scheduleOpt: true, slugOpt: true, page: false };

            var editor = CodeMirror.fromTextArea(angular.element('#editor')[0], {
                mode: "markdown",
                showCursorWhenSelecting: true,
                lineWrapping: true
            });

            editor.on('change', function () {
                $scope.$apply(function () {
                    $scope.post.markdown = editor.getValue();
                });
            });

            $scope.create = function () {
                $scope.setLoading('Saving');

                Posts.create($scope.post, function (post) {
                    $location.path('/posts/'+post.id+'/edit');
                });
            };
        }
    ]);

    ctrlsModule.controller('PostEditCtrl', ['$scope', '$filter', '$sce', '$routeParams', 'Posts', 'MarkdownConverter',
        function ($scope, $filter, $sce, $params, Posts, Converter) {
            $scope.opt = { customDate: '', editor: true, create: false };
            $scope.setBreadcrumb('postedit');

            var permalinks = {
                page: '/:slug.html',
                post: '/:year/:month/:day/:slug.html'
            };
            var tags = {
                ':slug': function (post) { return post.slug || ':slug:'; },
                ':year': function (post) { return moment(post.scheduledAt).year(); },
                ':month': function (post) { return moment(post.scheduledAt).format('MM'); },
                ':day': function (post) { return moment(post.scheduledAt).format('DD'); }
            };

            var editor = CodeMirror.fromTextArea(angular.element('#editor')[0], {
                mode: "markdown",
                showCursorWhenSelecting: true,
                lineWrapping: true
            });
            
            editor.on('change', function () {
                $scope.$apply(function () {
                    $scope.post.markdown = editor.getValue();
                });
            });

            $scope.$watch('post.markdown', function (value) {
                $scope.post.content = (!value) ? "" : Converter.makeHtml(value);
            });

            $scope.post = Posts.get({ id:$params.id }, function (post) {
                //TODO: remove blow two lines
                post.scheduleOpt = isDefined(post.scheduleOpt) ? post.scheduleOpt : true;
                post.slugOpt = isDefined(post.slugOpt) ? post.slugOpt : true;

                // editor.setValue(post.markdown || '');
            });

            $scope.now = function (format) {
                return moment().format(format || 'lll');
            };

            $scope.$watch('post.slug', updatePermalinks);
            $scope.$watch('post.page', updatePermalinks);
            $scope.$watch('post.scheduledAt', updatePermalinks);
            
            $scope.postContent = function () {
                return $sce.trustAsHtml($scope.post.content);
            };

            $scope.savePost = function () {
                $scope.setLoading('Saving');
                $scope.post.$update({id: $params.id}, function () {
                    $scope.setLoading(false);
                });
            };

            function updatePermalinks () {
                var $scope = arguments[2],
                    url = ($scope.post.page) ? permalinks.page : permalinks.post,
                    post = $scope.post;

                url = url.replace(/(:[a-z]+)/g, function (match) {
                    if (match in tags) {
                        return tags[match](post);
                    }
                    return match;
                });

                $scope.permalink = url;
            }
        }
    ]);

    ctrlsModule.controller('SettingsCtrl', ['$scope', 'Settings',
        function ($scope, Settings) {
            var hideLoading = bind($scope, $scope.setLoading, false);

            $scope.setLoading(true);
            $scope.setBreadcrumb('settings');
            $scope.settings = Settings.get(hideLoading);

            $scope.reset = function () {
                $scope.setLoading(true);
                $scope.settings = Settings.get(function () {
                    hideLoading();
                });
            };

            $scope.save = function () {
                $scope.setLoading('Saving');
                $scope.settings.$save().then(hideLoading);
            };
        }
    ]);

    ctrlsModule.controller('CommentsCtrl', ['$scope',
        function ($scope) {
            $scope.setBreadcrumb('comments');
        }
    ]);

    ctrlsModule.controller('UsersCtrl', ['$scope', '$timeout', 'Users',
        function ($scope, $timeout, Users) {
            $scope.setBreadcrumb('users');
            $scope.setLoading(true);
            $scope.passReq=true;

            $scope.$watch('master.name', function (name, oldName) {
                if (!name || !oldName || name == oldName) { return; }
                angular.element('.user-name').text(name);
            });

            $scope.$watch('passwd.verify', function (value) {
                if (!value) return;
                $scope.passForm.verify.$setValidity('match', value === $scope.passwd['new']);
            });

            $scope.loadUser = function () {
                $scope.setLoading(true);
                $scope.master = Users.get(function (user) {
                    $scope.user = copy(user);
                    $scope.setLoading(false);
                });
            };

            $scope.resetUser = function() {
                $scope.user = copy($scope.master);
            };

            $scope.saveUser = function() {
                $scope.setLoading('Saving');
                $scope.user.$update()
                    .then(function () {
                        $scope.master = copy($scope.user);
                        $scope.setLoading();
                    });
            };

            $scope.savePasswd = function() {
                $scope.setLoading('Changing password');
                Users.updatePassword($scope.passwd)
                    .$promise
                        .then(bind($scope, $scope.resetPasswd()))
                        .then(bind($scope, $scope.setLoading()));
            };

            $scope.resetPasswd = function() {
                $scope.passReq = false;
                $scope.passwd = { };
                $scope.passForm.$setPristine();

                // This is to prevent browser behaviour
                // which shows error message when required field is reset
                $timeout(function () {
                    $scope.passReq = true;
                });
            };

            $scope.loadUser();
        }
    ]);

    ctrlsModule.controller('RedirectEditCtrl', ['$scope', '$rootScope', 'Redirects',
        function ($scope, $rootScope, Redirects) {
            $scope.path = /^(\/[a-zA-Z0-9-_.]+)*\/?$/;
            $scope.isEdit = false;
            $scope.item = { type: 'internal' };

            $rootScope.$on('delete', reset);
            $rootScope.$on('edit', function (event, item) {
                $scope.item = copy(item);
                $scope.isEdit = true;
            });

            $scope.fix = function (value) {
                return (value[0] === '/' ? '' : '/') +
                    _.map((value || '').split('/'), function (item) {
                        return _.str.slugify(item);
                    }).join('/');
            };

            $scope.create = function () {
                var item = $scope.item;
                if (!item || $scope.isEdit || $scope.form.$invalid) return;

                $scope.setLoading('Creating');

                Redirects.create(item).$promise
                    .then(bind($scope, $scope.reset))
                    .then(bind($scope, $scope.$emit, 'load'));
            };

            $scope.update = function () {
                var item = $scope.item;
                if (!item || !$scope.isEdit || $scope.form.$invalid) return;

                $scope.setLoading('Updating');

                item.$update()
                    .then(bind($scope, $scope.reset))
                    .then(bind($scope, $scope.$emit, 'load'));
            };

            $scope.reset = reset;

            function reset () {
                $scope.isEdit = false;
                $scope.item = { from: '', to: '', type: 'internal' };
                $scope.form.$setPristine();
            }
    }]);

    ctrlsModule.controller('RedirectsListCtrl', ['$scope', '$rootScope', '$q', 'Redirects',
        function ($scope, $rootScope, $q, Redirects) {
            $scope.deleting = new Container();
            $scope.pg = new Pagination({ pageSize: 10 });

            $rootScope.$on('load', loadRedirects);

            $scope.$watchCollection("items", function (items) {
                $scope.pg.items = items && items.length || 0;
            });

            $scope.setBreadcrumb('settings', 'redirects');
            loadRedirects();

            $scope.delete = function () {
                $scope.setLoading('Deleting');
                if ($scope.deleting.isEmpty()) {
                    return;
                }

                var deletePromise = [];

                forEach($scope.items, function (item) {
                    if ($scope.deleting.has(item.id)) {

                        deletePromise.push(item.$remove());
                    }
                });

                $q.all(deletePromise)
                    .then(loadRedirects)
                    .then(bind($scope, $scope.$emit, 'delete'));
            };

            $scope.refresh = loadRedirects;

            function loadRedirects () {
                $scope.setLoading(true);
                $scope.items = Redirects.query(
                    function () {
                        $scope.setLoading(false);
                        $scope.deleting.empty();
                    }
                );
            }
    }]);

    ctrlsModule.controller('ThemesCtrl', ['$scope', '$q', '$window','Themes',
        function ($scope, $q, $window, Themes) {
            $scope.setBreadcrumb('themes');
            $scope.setLoading(true);

            $scope.theme = {
                site: { list: [], active: null, changed: false, selected: null },
                admin: { list: [], active: null, changed: false, selected: null,
                    afterSave: function () {
                        $window.location.reload();
                    }
                }
            };

            $scope.$watch('theme.site.selected', bind(null, checkThemes, $scope.theme.site));
            $scope.$watch('theme.site.active', bind(null, checkThemes, $scope.theme.site));
            $scope.$watch('theme.admin.selected', bind(null, checkThemes, $scope.theme.admin));
            $scope.$watch('theme.admin.active', bind(null, checkThemes, $scope.theme.admin));

            $scope.resetTheme = bind(null, resetTheme, $scope.theme);
            $scope.saveTheme = bind(null, saveTheme, $scope.theme);

            loadThemeDetails();

            function saveTheme (theme, type) {
                if (!theme[type].changed) {
                    return;
                }
                $scope.setLoading('Saving');

                Themes.update({ id:theme[type].selected.id, type:type })
                    .$promise
                    .then(bind($scope, $scope.setLoading, false))
                    .then(bind(null, afterThemeSave, theme, type));
            }

            function afterThemeSave (theme, type) {
                theme[type].active = theme[type].selected;
                (theme[type].afterSave || function () {})();
            }

            function resetTheme (theme, type) {
                theme[type].selected = theme[type].active;
            }

            function checkThemes (theme) {
                theme.changed = !angular.equals(theme.active, theme.selected);
            }

            function findActive (themes) {
                return _.findWhere(themes, { active:true });
            }

            function updateTheme (theme, themes) {
                var active = findActive(themes);

                theme.list = themes;
                theme.active = active;
                theme.selected = active;
            }

            function loadThemeDetails () {
                $q.all([
                    Themes.query({type:'site'}).$promise,
                    Themes.query({type:'admin'}).$promise
                ])
                .then(function (themes) {
                    $scope.setLoading(false);

                    updateTheme.call(null, $scope.theme.site, themes[0]);
                    updateTheme.call(null, $scope.theme.admin, themes[1]);
                });
            }
        }
    ]);
}());
