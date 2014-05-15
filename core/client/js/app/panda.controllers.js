(function () {
    'use strict';

    var bind        = angular.bind,
        forEach     = angular.forEach,
        isObject    = angular.isObject,
        copy        = angular.copy,
        element     = angular.element,
        isUndefined = angular.isUndefined;

    var controllers = angular.module('panda.controllers', ['panda.utils', 'password']);

    controllers.controller('RootCtrl', ['$scope', '$window', '$timeout', 'PostsInfo', 'Labels', 'Constants',
        function ($scope, $window, $timeout, Info, Labels, Constants) {
            $scope.loading = false;
            $scope.crumb = [];
            $scope.allLabels = [];
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
            $scope.$on('labels:load', reloadLabels);

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
                NProgress[!loading ? 'done' : 'start']();
            };

            $scope.setCrumb = function (props) {
                var args = Array.prototype.slice.call(arguments);

                if (angular.isNumber(args[0])) {
                    updateCrumbItem(args);
                } else {
                    updateCrumb(args);
                }
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

            function reloadLabels () {
                 Labels.query(function (labels) {
                     $scope.allLabels = labels;
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

    controllers.controller('OverviewCtrl', ['$scope', 'Redirects', 'Constants',
        function ($scope, Redirects, Constants) {
            $scope.setCrumb('overview');
            $scope.setLoading(true);

            $scope.$emit('post:load');
            $scope.$emit('page:load');

            $scope.redirects = Redirects.query();

            $scope.translate = function(name) {
                return Constants.pageNames[name];
            };

            $scope.setLoading(false);
        }
    ]);

    controllers.controller('PostListCtrl',
        ['$scope', '$routeParams', '$q', 'filterFilter', 'statusFilter', 'Posts', 'Utils',
        function ($scope, $params, $q, filter, status, Posts, Utils) {
            $scope.type = $params.type;
            $scope.pg = Utils.pagination();
            $scope.select = Utils.selection();
            $scope.order = Utils.ordering({
                classes: {none: 'fa-sort', up: 'fa-caret-up', down: 'fa-caret-down'}});
            $scope.search = {};
            $scope.labels = [];

            $scope.$watchCollection('search', function(){
                $scope.pg.items = filter($scope.posts, $scope.search);
            });

            $scope.$watch('order.orderBy', function () {
                $scope.pg.current = 1;
            });

            $scope.$watch('posts', function () {
                $scope.labels = _.chain($scope.posts)
                    .flatten('labels')
                    .countBy()
                    .reduce(function (labels, count, label) {
                        labels.push({label: label, count: count});
                        return labels;
                    }, []).value();
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
                        $scope.select.add(post.id, status(post));
                    });
                    sel.all = true;
                }
            };

            $scope.filterByLabel = function (label) {
                $scope.search.labels = label;
            };

            $scope.doSearchReset = function () {
                $scope.search = {};
            };

            $scope.remove = function () {
                $scope.setLoading('Deleting');
                var deletePromises = [];

                forEach($scope.posts, function (post) {
                    // allow deletion of draft posts only
                    if ($scope.select.has(post.id) && status(post) === 'D') {
                        deletePromises.push(post.$remove());
                    }
                });

                $q.all(deletePromises).then(bind($scope, $scope.$emit, 'post:delete'));
            };

            $scope.draft = function () {
                $scope.setLoading('Reverting to draft');
                var promises = [];
                forEach($scope.posts, function (post) {
                    if ($scope.select.has(post.id) && status(post) !== 'D') {
                        promises.push(Posts.update({ draft: true }, {id: post.id}).$promise);
                    }
                });

                $q.all(promises).then(bind($scope, $scope.$emit, 'post:draft'));
            };

            $scope.publish = function () {
                $scope.setLoading('Publishing');
                var promises = [];
                forEach($scope.posts, function (post) {
                    if ($scope.select.has(post.id) && status(post) === 'D') {
                        promises.push(Posts.update({ publish: true }, {id: post.id}).$promise);
                    }
                });

                $q.all(promises).then(bind($scope, $scope.$emit, 'post:publish'));
            };

            loadPosts();

            function loadPosts() {
                $scope.setLoading(true);
                $scope.select.empty();
                Posts.query({
                    type: $params.type,
                    page: $scope.page
                }).$promise.then(function (posts) {
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
            $scope.setCrumb('posts', $params.type);
            $scope.page = false;

            $scope.$emit('post:load'); // load post statistics
        }
    ]);

    controllers.controller('PagesCtrl', ['$scope', '$routeParams',
        function ($scope, $params) {
            $scope.setCrumb('pages', $params.type);
            $scope.page = true;

            $scope.$emit('page:load');  // load page statistics
        }
    ]);

    controllers.controller('LabelsCtrl', ['$scope',
        function ($scope) {
            $scope.$emit('labels:load');

            $scope.addLabel = function (label) {
                if (angular.isArray(label)) {
                    forEach(label, add);
                }
                else { add(label); }

                $scope.labels = [];

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
                if (isUndefined(opt)) {
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
                tags = {
                    ':slug': function (post) {
                        return post.slug || ':slug:';
                    },
                    ':year': function (post) {
                        return moment(post.publishedAt).year();
                    },
                    ':month': function (post) {
                        return moment(post.publishedAt).format('MM');
                    },
                    ':day': function (post) {
                        return moment(post.publishedAt).format('DD');
                    }
                };

            $q.all([
                Settings.get({ id: 'app:postUrl' }).$promise,
                Settings.get({ id: 'app:pageUrl' }).$promise
            ])
                .then(function (values) {
                    $scope.permalinks = {
                        post: values[0].value,
                        page: values[1].value
                    };
                    $scope.$watch('post.slug', updatePermalinks);
                    $scope.$watch('post.page', updatePermalinks);
                    $scope.$watch('post.publishedAt', updatePermalinks);
                });

            $scope.$watch('post.autoSlugOpt', function (autoSlugOpt) {
                if (isUndefined(autoSlugOpt)) {
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
                var url = ($scope.post.page) ? $scope.permalinks.page : $scope.permalinks.post,
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
            $scope.setCrumb('postedit');
            $scope.opt = { customDate: '', editor: true, create: false };
            $scope.post = {};
            $scope.user = Users.get();

            var editor = CodeMirror.fromTextArea(element('#editor')[0], {
                mode: "markdown",
                showCursorWhenSelecting: true,
                lineWrapping: true,
                extraKeys: {
                    "Ctrl-1": "h1", "Ctrl-2": "h2", "Ctrl-3": "h3", "Ctrl-4": "h4", "Ctrl-5": "h5", "Ctrl-6": "h6",
                    "Ctrl-B": "bold", "Meta-B": "bold", "Ctrl-I": "italic", "Meta-I": "italic", "Ctrl-Alt-U": "strike",
                    "Ctrl-L": "link", "Ctrl-P": "image",
                    "Ctrl-Q": "blockquote"
                }
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
                $scope.post = Posts.get({ id:$params.id }, function (post) {
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

    controllers.controller('UsersCtrl', ['$scope', '$timeout', 'Users',
        function ($scope, $timeout, Users) {
            $scope.setCrumb('users');
            $scope.setLoading(true);

            $scope.$watch('master.name', function (name, oldName) {
                if (!name || !oldName || name == oldName) { return; }
                angular.element('.user-name').text(name);
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

            $scope.loadUser();
        }
    ]);

    controllers.controller('PasswordCtrl', ['$scope', '$timeout', 'Users', 'Password',
        function ($scope, $timeout, Users, Password) {
            $scope.passReq=true;
            $scope.passwd = { };

            $scope.$watch('passwd.verify', function (value) {
                if (!value) return;
                $scope.passForm.verify.$setValidity('match', value === $scope.passwd.change);
            });

            $scope.$watch('passwd.change', function (passwd) {
                if (!passwd) return;
                $scope.passwd.strength = Password.checkStrength(passwd);
            });

            $scope.savePasswd = function() {
                $scope.setLoading('Changing password');
                Users.updatePassword(_.pick($scope.passwd, 'change', 'verify', 'current'))
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
        }
    ]);

    controllers.controller('RedirectEditCtrl', ['$scope', '$rootScope', 'Redirects',
        function ($scope, $rootScope, Redirects) {
            $scope.path = /^(\/[a-zA-Z0-9-_.]+)*\/?$/;
            resetForm();

            $rootScope.$on('delete', resetForm);
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
                if (!$scope.item || $scope.isEdit || $scope.form.$invalid) return;

                $scope.setLoading('Creating');

                Redirects.create($scope.item).$promise
                    .then(bind($scope, $scope.reset))
                    .then(bind($scope, $scope.$emit, 'load'));
            };

            $scope.update = function () {
                if (!$scope.item || !$scope.isEdit || $scope.form.$invalid) return;

                $scope.setLoading('Updating');

                $scope.item.$update()
                    .then(bind($scope, $scope.reset))
                    .then(bind($scope, $scope.$emit, 'load'));
            };

            $scope.reset = resetForm;

            function resetForm() {
                $scope.isEdit = false;
                $scope.item = { from: '', to: '', type: '302' };
                if ($scope.form) {
                    $scope.form.$setPristine();
                }
            }
    }]);

    controllers.controller('RedirectsListCtrl', ['$scope', '$rootScope', 'Redirects', 'Utils',
        function ($scope, $rootScope, Redirects, Utils) {
            $scope.pg = Utils.pagination();
            $scope.order = Utils.ordering({
                classes: {none: 'fa-sort', up: 'fa-caret-up', down: 'fa-caret-down'}
            });
            $scope.url = { $: '' };
            $scope.status = { verify: false, save: false };
            $scope.verification = { items: [] };

            $rootScope.$on('load', loadRedirects);

            $scope.$watch('order.orderBy', function(){
                $scope.pg.current = 1;
            });

            $scope.$watchCollection("items", function (items) {
                $scope.pg.items = items && items.length || 0;
            });

            $scope.setCrumb('settings', 'redirects');
            loadRedirects();

            $scope.clearVerification = function () {
                $scope.verification.items = [];
            };

            $scope.hasVerification = function () {
                return !!$scope.verification.items.length;
            };

            $scope.clrSearch = function () {
                $scope.url.$ = '';
            };

            $scope.hasSearch = function () {
                return !$scope.url.$.length;
            };

            $scope.remove = function (item) {
                $scope.setLoading('Deleting');

                item.$remove()
                    .then(loadRedirects)
                    .then(bind($scope, $scope.$emit, 'delete'))
                    .catch(bind($scope, $scope.$emit, 'api:error'));
            };

            $scope.verify = function () {
                if (!$scope.items || $scope.items.length<2) {
                    return;
                }
                $scope.setLoading('Verification');
                $scope.verification.items = [];
                var chain;

                $scope.items.forEach(function (item) {
                    chain = _.find($scope.items, { from: item.to });
                    if (chain) {
                        $scope.verification.items.push({ item:item, chain:chain });
                    }
                });
                $scope.setLoading(false);
            };

            $scope.refresh = loadRedirects;

            function loadRedirects () {
                $scope.setLoading(true);
                Redirects.query().$promise
                    .then(function(items){
                        $scope.items = items;
                        $scope.setLoading(false);
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
                    type.ips = _.chain(type.ips||[]).push(ip).sort().uniq(true).value();
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

    controllers.controller('ImagePreviewCtrl', ['$scope', '$modalInstance', 'image',
        function($scope, $modalInstance, image) {
            $scope.image = image;

            $scope.close = function(){
                $modalInstance.close();
            };
        }
    ]);

    controllers.controller('PluginInfoCtrl', ['$scope', '$modalInstance',
        function ($scope, $instance) {
            $scope.close = function(){
                $instance.close();
            };
        }
    ]);

    controllers.controller('PluginsCtrl', ['$scope', '$modal', 'Plugins',
        function ($scope, $modal, Plugins) {
            $scope.setCrumb('plugins');

            $scope.loadPlugins = function () {
                $scope.setLoading(true);
                Plugins.get(function (info) {
                    $scope.setLoading();
                    $scope.info = info;
                });
            };

            $scope.start = function (plugin) {
                $scope.setLoading(true);
                plugin.starting = true;
                Plugins.start({id: plugin.code}, $scope.loadPlugins, $scope.loadPlugins);
            };

            $scope.stop = function (plugin) {
                $scope.setLoading(true);
                plugin.stopping = true;
                Plugins.stop({id: plugin.code}, $scope.loadPlugins, $scope.loadPlugins);
            };

            $scope.showInfo = function (plugin) {
                $scope.plugin = plugin;

                $modal.open({
                    templateUrl: 'plugininfo',
                    controller: 'PluginInfoCtrl',
                    scope: $scope
                });
            };

            $scope.loadPlugins();
        }
    ]);

    controllers.controller('ImgCtrl', ['$scope', '$fileUploader', '$timeout', '$modal', 'Images',
        function ($scope, $fileUploader, $timeout, $modal) {

            $scope.setCrumb('images', 'upload');
//            $scope.setLoading(true);

            var uploader = $scope.uploader = $fileUploader.create({
                scope: $scope, // to automatically update the html. Default: $rootScope
                url: '/api/v1/upload',
                formData: [
                    { key: 'value' }
                ],
                filters: [
                    function (item) { // first user filter
                        console.info('filter1');
                        return true;
                    }
                ]
            });

            // Temporarily commented out
//            $scope.images = Images.query(function () {
//                $scope.setLoading(false);
//            });

            $scope.open = function (index) {
                $modal.open({
                    templateUrl: 'imagepreview',
                    controller: 'ImagePreviewCtrl',
                    size: 'lg',
                    resolve: {
                        image: function() {
                            return $scope.images[index];
                        }
                    }
                });
            };

            $scope.onFileSelect = function ($files) {
                $scope.selectedFiles = $files;
                $scope.progress = [];
                $scope.upload = [];
                $scope.uploadResult = [];
//                $scope.dataUrls = [];

//                forEach($files, function ($file, idx) {
//                    if (window.FileReader && $file.type.indexOf('image') > -1) {
//                        var fileReader = new FileReader();
//                        fileReader.readAsDataURL($file);
//                        setPreview(fileReader, idx);
//                    }
//                });

                $timeout(function(){
                    forEach($files, function($file, index){
                        $scope.start(index);
                    });
                }, 2000);
            };

            $scope.abort = function(index) {
                $scope.upload[index].abort();
                $scope.upload[index] = null;
            };

            $scope.start = function (index) {
                $scope.progress[index] = 0;

//                $scope.upload[index] = $upload
//                    .upload({
//                        url: '/api/v1/upload',
//                        file: $scope.selectedFiles[index]
//                    })
//                    .then(completion, null, progress);

                function completion() {
                    $scope.progress[index] = 100;
                }

                function progress(evt) {
                    $scope.progress[index] = parseInt(100.0 * evt.loaded / evt.total);
                }
            };

//            function setPreview(reader, index) {
//                reader.onload = function (e) {
//                    $timeout(function () {
//                        $scope.dataUrls[index] = e.target.result;
//                    });
//                };
//            }

        }
    ]);

}());
