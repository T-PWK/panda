(function () {
    'use strict';

    var isDefined   = angular.isDefined,
        bind        = angular.bind,
        forEach     = angular.forEach,
        isObject    = angular.isObject,
        copy        = angular.copy,
        element     = angular.element;

    var controllers = angular.module('panda.controllers', ['panda.utils']);

    controllers.controller('RootCtrl', ['$scope', '$window', '$timeout', 'PostsInfo', 'Constants',
        function ($scope, $window, $timeout, Info, Constants) {
            $scope.loading = false;
            $scope.crumb = [];
            $scope.postStats = {};
            $scope.pageStats = {};

            // Redirect to login page in case of session expiration
            $scope.$on('api:error', function (event, error) {
                if (error && error.status === 401) {
                    $window.location.href='/login';
                }
            });

            // Reload current window
            $scope.$on('location:reload', bind($window.location, $window.location.reload));

            $scope.$on('post:load', function(){
                if (!$scope.postStats.all) reloadPostStats();
            });

            $scope.$on('page:load', function(){
                if (!$scope.pageStats.all) reloadPageStats();
            });

            $scope.$on('post:delete', reloadPostStats);
            $scope.$on('post:create', reloadPostStats);
            $scope.$on('post:publish', reloadPostStats);
            $scope.$on('post:draft', reloadPostStats);
            $scope.$on('post:edit', reloadPostStats);

            $scope.$on('post:delete', reloadPageStats);
            $scope.$on('post:create', reloadPageStats);
            $scope.$on('post:publish', reloadPageStats);
            $scope.$on('post:draft', reloadPageStats);
            $scope.$on('post:edit', reloadPageStats);

            $scope.setLoading = function (loading) {
                $scope.isLoading = loading;
                if (!loading) {
                    NProgress.done();
                } else {
                    NProgress.start();
                }
            };

            $scope.setCrumb = function (props) {
                var args = Array.prototype.slice.call(arguments);

                if (angular.isNumber(args[0])) {
                    updateCrumbItem(args);
                } else {
                    updateCrumb(args);
                }
            };

            $scope.status = postStatus;

            $scope.statusText = function (post) {
                return Constants.status[postStatus(post)];
            };

            function updateCrumbItem (args) {
                if (isObject(args[1])) {
                    angular.extend($scope.crumb[args[0]], args[1]);
                } 
                else {
                    $scope.crumb[args[0]].display = args[1];
                }
            }

            function updateCrumb (args) {
                $scope.crumb = [];
                forEach(args, function (id) {
                    if (angular.isString(id)) {
                        this.push({ id: id, display: Constants.pageNames[id] || id });
                    }
                    else if (isObject(id)) {
                        this.push(copy(id));
                    }
                }, $scope.crumb);
            }

            function reloadPostStats () {
                $scope.loadingPostStats = true;
                Info.get({id: 'count', page: false }, function (stats) {
                    $scope.postStats = stats;
                    $scope.loadingPostStats = false;
                });
            }

            function reloadPageStats () {
                $scope.loadingPageStats = true;
                Info.get({id: 'count', page: true }, function (stats) {
                    $scope.pageStats = stats;
                    $scope.loadingPageStats = false;
                });
            }
        }
    ]);

    controllers.controller('NavRootCtrl', ['$scope', '$rootScope', 'Users',
        function ($scope, $root, Users) {
            $scope.user = Users.get();
            $root.$on('user:update', function (event, user) {
                $scope.user = user;
            });
            $root.$on('cfg:host', function (event, host) {
                if (host) {
                    $scope.url = "http://" + host;
                }
            });
        }
    ]);

    controllers.controller('OverviewCtrl', ['$scope',
        function ($scope) {
            $scope.setCrumb('overview');
        }
    ]);

    controllers.controller('PostListCtrl', ['$scope', '$routeParams', '$q', 'filterFilter', 'Posts', 'Utils',
        function ($scope, $params, $q, filter, Posts, Utils) {
            $scope.type = $params.type;
            $scope.pg = Utils.pagination();
            $scope.select = Utils.selection();
            $scope.search = { title: '' };

            $scope.$watch('search.title', function(){
                $scope.pg.items = filter($scope.posts, $scope.search);
                console.info(filter($scope.posts, $scope.search));
            });

            $scope.$on('post:publish', loadPosts);
            $scope.$on('post:draft', loadPosts);
            $scope.$on('post:delete', loadPosts);

            $scope.showForm = function () {
                return $scope[$scope.page?'pageStats':'postStats'][$params.type] > 0;
            };

            $scope.selectAll = function () {
                var sel = $scope.select;
                if (sel.all) {
                    $scope.select.empty();
                } else {
                    forEach($scope.posts, function (post) {
                        $scope.select.add(post.id, postStatus(post));
                    });
                    sel.all = true;
                }
            };

            $scope.doSearchReset = function () {
                $scope.search.title = '';
            };

            $scope.delete = function () {
                $scope.setLoading('Deleting');
                var deletePromises = [];

                forEach($scope.posts, function (post) {
                    // allow deletion of draft posts only
                    if ($scope.select.has(post.id) && postStatus(post) === 'D') {
                        deletePromises.push(post.$remove());
                    }
                });

                $q.all(deletePromises).then(bind($scope, $scope.$emit, 'post:delete'));
            };

            $scope.draft = function () {
                $scope.setLoading('Reverting to draft');
                var promises = [];
                forEach($scope.posts, function (post) {
                    if ($scope.select.has(post.id) && postStatus(post) !== 'D') {
                        promises.push(Posts.update({ draft: true }, {id: post.id}).$promise);
                    }
                });

                $q.all(promises).then(bind($scope, $scope.$emit, 'post:draft'));
            };

            $scope.publish = function () {
                $scope.setLoading('Publishing');
                var promises = [];
                forEach($scope.posts, function (post) {
                    if ($scope.select.has(post.id) && postStatus(post) === 'D') {
                        promises.push(Posts.update({ publish: true }, {id: post.id}).$promise);
                    }
                });

                $q.all(promises).then(bind($scope, $scope.$emit, 'post:publish'));
            };

            $scope.setSortBy = function (sortBy) {
                $scope.sortBy = sortBy;
                $scope.pg.current = 1;
            };

            loadPosts();

            function postViewSetChange (newValue, oldValue) {
                if (newValue !== oldValue) {
                    loadPosts();
                }
            }

            function loadPosts () {
                $scope.setLoading(true);
                $scope.select.empty();
                Posts.query({
                    type: $params.type,
                    page: $scope.page
                }).$promise
                    .then(function (posts) {
                        $scope.setLoading(false);
                        $scope.posts = posts;
                        $scope.pg.items = posts;
                        $scope.setCrumb(1, { data: posts.length });
                    })
                    .catch(bind($scope, $scope.$emit, 'api:error'));
            }
        }
    ]);

    controllers.controller('PostsCtrl', ['$scope', '$routeParams',
        function ($scope, $params) {
            $scope.page = false;
            $scope.setCrumb('posts', $params.type);
            $scope.$emit('post:load'); // load post statistics
        }
    ]);

    controllers.controller('PagesCtrl', ['$scope', '$routeParams',
        function ($scope, $params) {
            $scope.page = true;
            $scope.setCrumb('pages', $params.type);
            $scope.$emit('page:load');  // load page statistics
        }
    ]);

    controllers.controller('LabelsCtrl', ['$scope', 'Labels',
        function ($scope, Labels) {
            $scope.allLabels = Labels.query();

            $scope.addLabel = function (label) {
                if (angular.isArray(label)) {
                    forEach(label, add);
                }
                else { add(label); }

                function add (label) {
                    var labels = $scope.post.labels || ($scope.post.labels = []);

                    if (!label || _.contains(labels, label)) {
                        return;
                    }

                    labels.push(label);
                    labels.sort();
                }
            };

            $scope.delLabel = function (label) {
                var labels = $scope.post.labels || ($scope.post.labels = []),
                    idx = labels.indexOf(label);

                if (~idx) labels.splice(idx, 1);
            };
    }]);

    controllers.controller('ScheduleCtrl', ['$scope',
        function ($scope) {
            $scope.now = function (format) {
                return moment().format(format || 'lll');
            };

            $scope.$watch('post.autoPublishOpt', function (opt) {
                if ('undefined' === typeof opt) {
                    return;
                }
                $scope.opt.customSchedule = (opt ? moment() : moment($scope.post.publishedAt)).format('lll');
            });

            $scope.$watch('opt.customSchedule', function (value) {
                var date = moment(value);

                $scope.opt.customScheduleValid = date.isValid();
                if (date.isValid()) {
                    $scope.post.publishedAt = date.toDate();
                }
            });
        }
    ]);

    controllers.controller('SlugCtrl', ['$scope', '$q', 'Settings',
        function ($scope, $q, Settings) {
            var unwatchTitle,
                permalinks = { page: '', post: '' },
                tags = {
                    ':slug': function (post) { return post.slug || ':slug:'; },
                    ':year': function (post) { return moment(post.publishedAt).year(); },
                    ':month': function (post) { return moment(post.publishedAt).format('MM'); },
                    ':day': function (post) { return moment(post.publishedAt).format('DD'); }
                };

            $q.all([
                Settings.get({ id:'app:postUrl' }).$promise,
                Settings.get({ id:'app:pageUrl' }).$promise
            ]).then(function(values){
                permalinks.post = values[0].value;
                permalinks.page = values[1].value;
            });

            $scope.$watch('post.slug', updatePermalinks);
            $scope.$watch('post.page', updatePermalinks);
            $scope.$watch('post.publishedAt', updatePermalinks);

            $scope.$watch('post.autoSlugOpt', function (autoSlugOpt) {
                if ('undefined' === typeof autoSlugOpt) {
                    return;
                }
                if(autoSlugOpt) {
                    unwatchTitle = $scope.$watch('post.title', setSlugFromTitle);
                } else if(unwatchTitle) {
                    unwatchTitle();
                }
            });

            $scope.fix = function (text) {
                $scope.post.slug = _.str.slugify(text);
            };

            function setSlugFromTitle (text) {
                if (!text) {
                    $scope.post.slug = '';
                } else {
                    $scope.post.slug = _.str.slugify(text);
                }
            }

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


    controllers.controller('NewPostCtrl', ['$scope', '$location', 'Posts',
        function ($scope, $location, Posts) {
            $scope.setCrumb('newpost');
            $scope.opt = { customDate: '', editor: true, create: true };
            $scope.post = { autoPublishOpt: true, autoSlugOpt: true, page: false };

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

                var post = new Posts($scope.post);

                Posts.create($scope.post, function (post) {
                    $scope.$emit('post:create');
                    $location.path('/posts/'+post.id+'/edit');
                });
            };
        }
    ]);

    controllers.controller('PostEditCtrl',
        ['$scope', '$filter', '$sce', '$q', '$timeout', '$routeParams', 'Posts', 'Users', 'MarkdownConverter',
        function ($scope, $filter, $sce, $q, $timeout, $params, Posts, Users, Converter) {
            $scope.opt = { customDate: '', editor: true, create: false };
            $scope.setCrumb('postedit');
            $scope.post = {};
            $scope.user = Users.get();

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

            function loadPost() {
                $scope.setLoading(true);
                Posts.get({ id:$params.id }, function (post) {
                    $scope.post = post;
                    $scope.setLoading();
                    $timeout(function () {
                        editor.setValue(post.markdown || '');
                    });
                });
            }

            loadPost();

            $scope.titleize = function () {
                $scope.post.title = _.str.titleize($scope.post.title || '');
            };

            $scope.canSave = function () {
                return $scope.user.$resolved && $scope.post.$resolved;
            };

            $scope.postContent = function () {
                return $sce.trustAsHtml($scope.post.content);
            };

            $scope.save = function () {
                $scope.setLoading('Saving');
                $scope.post.author = $scope.user.id;
                $scope.post.$update(function () {
                    $scope.$emit('post:edit');
                    $scope.setLoading(false);
                });
            };

            $scope.publish = function () {
                $scope.setLoading('Publishing');
                $scope.post.author = $scope.user.id;
                $scope.post.$update({id: $params.id, publish: true }, function () {
                    $scope.$emit('post:publish');
                    $scope.setLoading(false);
                });
            };

            $scope.draft = function() {
                $scope.setLoading('Reverting to draft');
                $scope.post.author = $scope.user.id;
                Posts.update({ draft: true }, {id: $params.id}).$promise
                    .then(function(){
                        $scope.$emit('post:draft');
                        loadPost();
                    })
                    .catch(bind($scope, $scope.$emit, 'api:error'));
            };
        }
    ]);

    controllers.controller('SettingsCtrl', ['$scope', 'Settings',
        function ($scope, Settings) {
            $scope.setLoading(true);
            $scope.setCrumb('settings', 'basic');
            $scope.reset = loadSettings;
            $scope.save = function () {
                $scope.setLoading('Saving');
                $scope.settings.$save()
                    .then(function (settings) {
                        $scope.$emit('cfg:host', settings.host);
                        $scope.setLoading();
                    })
                    .catch(bind($scope, $scope.$emit, 'api:error'));
            };

            loadSettings();

            function loadSettings() {
                $scope.setLoading(true);
                Settings.get().$promise
                    .then(function (settings) {
                        $scope.settings = settings;
                        $scope.setLoading();
                    })
                    .catch(bind($scope, $scope.$emit, 'api:error'));
            }
        }
    ]);

    controllers.controller('CommentsCtrl', ['$scope',
        function ($scope) {
            $scope.setCrumb('comments');
        }
    ]);

    controllers.controller('UsersCtrl', ['$scope', '$timeout', 'Users',
        function ($scope, $timeout, Users) {
            $scope.setCrumb('users');
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
                Users.get().$promise
                    .then(function (user) {
                        $scope.master = user;
                        $scope.user = copy(user);
                        $scope.setLoading(false);
                    })
                    .catch(bind($scope, $scope.$emit, 'api:error'));
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
                        $scope.$emit('user:update', $scope.master);
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
                $scope.passwd = { 'new': '' };
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

    controllers.controller('RedirectEditCtrl', ['$scope', '$rootScope', 'Redirects',
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

    controllers.controller('RedirectsListCtrl', ['$scope', '$rootScope', '$q', 'Redirects', 'Utils',
        function ($scope, $rootScope, $q, Redirects, Utils) {
            $scope.deleting = Utils.selection();
            $scope.pg = Utils.pagination();
            $scope.url = { $: '' };

            $rootScope.$on('load', loadRedirects);

            $scope.$watchCollection("items", function (items) {
                $scope.pg.items = items && items.length || 0;
            });

            $scope.setCrumb('settings', 'redirects');
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
                    .then(bind($scope, $scope.$emit, 'delete'))
                    .catch(bind($scope, $scope.$emit, 'api:error'));
            };

            $scope.refresh = loadRedirects;

            function loadRedirects () {
                $scope.setLoading(true);
                Redirects.query().$promise
                    .then(function(items){
                        $scope.items = items;
                        $scope.setLoading(false);
                        $scope.deleting.empty();
                    })
                    .catch(bind($scope, $scope.$emit, 'api:error'));
            }
    }]);

    controllers.controller('IpsCtrl', ['$scope', '$q', 'Ips',
        function ($scope, $q, Ips) {

            $scope.setCrumb('settings', 'ips');
            $scope.setLoading(true);

            $scope.ipAddress = /^(\d{1,3}\.){3}\d{1,3}$/;
            $scope.stopLoading = bind($scope, $scope.setLoading, false);

            $scope.site = {enabled: false, ips:[]};
            $scope.admin = {enabled: false, ips:[]};

            $q.all([ loadIps('admin'), loadIps('site') ]).then($scope.stopLoading);

            $scope.remove = function (type, ip) {
                _.pull(type.ips, ip);
                type.dirty = true;
            };

            $scope.reset = function (type) {
                $scope.setLoading(true);
                loadIps(type).then($scope.stopLoading);
            };

            $scope.save = function (type) {
                if (!type.dirty) return;
                $scope.setLoading(true);

                type.$save().then($scope.stopLoading);
            };

            $scope.addIp = function(type, ip) {
                ip = ip || type.ip;
                if(ip) {
                    type.ips = _.chain(type.ips||[]).push(ip).sortBy().uniq(true).value();
                    type.dirty = true;
                }
            };

            $scope.hasCurrent = function (type) {
                return _.indexOf(type.ips, type.currentIp, true) > -1;
            };

            $scope.resetIp = function (type, form) {
                form.$setPristine();
                type.ip = '';
            };

            function loadIps(type) {
                return Ips.get({type:type})
                    .$promise
                    .then(function (info) { $scope[type] = info; });
            }
        }
    ]);

    controllers.controller('ThemesCtrl', ['$scope', '$q', '$http', '$timeout', 'Themes',
        function ($scope, $q, $http, $timeout, Themes) {
            $scope.setCrumb('themes');
            $scope.setLoading(true);

            $scope.theme = {
                site: {
                    list: [], active: null, changed: false, selected: null
                },
                admin: {
                    list: [], active: null, changed: false, selected: null,
                    afterSave: function (theme, type, serverTheme) {
                        var adminStyle = element('#admin');

                        $http.get(updateHref(adminStyle.prop('href')))
                            .then(function () {
                                $timeout(function () {
                                    adminStyle.prop('href', updateHref(adminStyle.prop('href')));
                                }, 500);
                            });

                        function updateHref (href) {
                            return href.replace(/\/\w+(\.\w+)+$/, '/' + serverTheme.data);
                        }
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
                    .then(bind(null, afterThemeSave, theme, type))
                    .then(bind($scope, $scope.setLoading, false));
            }

            function afterThemeSave (theme, type, serverTheme) {
                theme[type].active = theme[type].selected;
                (theme[type].afterSave || function () {})(theme, type, serverTheme);
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
                })
                .catch(bind($scope, $scope.$emit, 'api:error'));
            }
        }
    ]);

    controllers.controller('ImgCtrl', ['$scope', '$upload',
        function ($scope, $upload) {
            $scope.setCrumb('images');

            $scope.sayHello = function (files) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];

                    $scope.upload = $upload.upload({
                        url: '/api/v1/upload',
                        file: file
                    });
                }
            };
        }
    ]);

    function postStatus(post) {
        if (!post.published) return 'D';

        var date = post.publishedAt;
        if (!angular.isDate(date)) {
            date = new Date(date);
        }
        if (date > Date.now()) { // Convert string to date
            return 'S';
        }
        return 'A';
    }

}());
