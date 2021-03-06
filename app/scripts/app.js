'use strict';
/*global io*/
/* global TimetrackerConfiguration*/

/**
 * @ngdoc overview
 * @name timetrackerClientApp
 * @description
 * # timetrackerClientApp
 *
 * Main module of the application.
 */
angular.module('timetrackerApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngLocale',
    'mgcrea.ngStrap',
    'btford.socket-io',
    'chart.js',

    'timetrackerApp.model.user',
    'timetrackerApp.model.project',
    'timetrackerApp.model.booking',
    'timetrackerApp.model.person',

    'timetrackerApp.service.bookings',
    'timetrackerApp.service.projects',
    'timetrackerApp.service.assignment',
    'timetrackerApp.service.stat',

    'timetrackerApp.directives.username',

    // Controllers
    'timetrackerApp.controller.navbar',
    'timetrackerApp.controller.booking',
    'timetrackerApp.controller.project',
    'timetrackerApp.controller.management',
    'timetrackerApp.controller.admin',
    'timetrackerApp.controller.dashboard',
    'timetrackerApp.controller.login',
    'timetrackerApp.controller.registration'

])

    .run(['$rootScope', '$location', '$alert',

        function ($rootScope, $location, $alert) {
            $rootScope.$location = $location;
            $rootScope.config = TimetrackerConfiguration;

            /**
             * Generical error display handler
             */
            $rootScope.showError = function (errorData) {
                var text = errorData.data ? errorData.data : errorData;
                $alert({
                    title: 'Ooops!',
                    content: text,
                    placement: 'top',
                    duration: 5,
                    type: 'danger',
                    show: true
                });
            };

        }
    ])
    .factory('socket', function ($rootScope, socketFactory) {
        // https://auth0.com/blog/2014/01/15/auth-with-socket-io/

        var host;
        if ($rootScope.config.server.indexOf('https') >= 0) {
            host = $rootScope.config.server.replace(/^https/, 'wss');
        } else {
            host = $rootScope.config.server.replace(/^http/, 'ws');
        }

        var myIoSocket = io.connect(host, {reconnection: true, transports: ['websocket', 'polling', 'xhr-polling']});

        var mySocket = socketFactory({
            ioSocket: myIoSocket
        });

        return mySocket;
    })
    .factory('authHttpResponseInterceptor', ['$rootScope', '$q', '$location', '$log',
        function ($rootScope, $q, $location, $log) {
            return {
                response: function (response) {
                    if (response.status === 401) {
                        $log.info('Response 401');
                    }
                    return response || $q.when(response);
                },
                responseError: function (rejection) {
                    if (rejection.status === 401) {
                        $log.info('Response Error 401');
                        $rootScope.$broadcast('401');
                        $location.path('/login');
                    }
                    return $q.reject(rejection);
                }
            };
        }])
    .config(['$httpProvider', function ($httpProvider) {
        //Http Intercpetor to check auth failures for xhr requests
        $httpProvider.interceptors.push('authHttpResponseInterceptor');
    }])

    .config(function ($httpProvider) {
        $httpProvider.defaults.withCredentials = true;
    })

    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/dashboard.html',
                controller: 'DashboardCtrl',
                requireLogin: true
            })
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl',
                requireLogin: false
            })
            .when('/signup', {
                templateUrl: 'views/signup.html',
                controller: 'RegistrationCtrl',
                requireLogin: false
            })

            .when('/projects', {
                templateUrl: 'views/projects.html',
                controller: 'ProjectCtrl',
                requireLogin: true
            })
            .when('/bookings/:projectId', {
                templateUrl: 'views/bookings.html',
                controller: 'BookingCtrl',
                requireLogin: true
            })
            .when('/bookings', {
                templateUrl: 'views/bookings.html',
                controller: 'BookingCtrl',
                requireLogin: true
            })
            .when('/management', {
                templateUrl: 'views/management.html',
                controller: 'ManagementCtrl',
                requireLogin: true
            })
            .when('/administration', {
                templateUrl: 'views/administration.html',
                controller: 'AdminCtrl',
                requireLogin: true
            })
            .otherwise({
                redirectTo: '/'
            });
    });
