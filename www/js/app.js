// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// the 2nd parameter is an array of 'requires'
// 'chroni.controllers' is found in controllers.js
angular.module('chroni', ['ionic', 'chroni.controllers', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'pages/menu/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'pages/home/home.html',
        controller: 'homeCtrl'
      }
    }
  })

  .state('app.history', {
    url: '/history',
    views: {
      'menuContent': {
        templateUrl: 'pages/history/history.html'
      }
    }
  })

  .state('app.viewFiles', {
    url: '/viewFiles',
    views: {
      'menuContent': {
        templateUrl: 'pages/viewFiles/viewFiles.html',
        controller: 'viewFilesCtrl'
      }
    }
  })

  .state('app.importFiles', {
    url: '/importFiles',
    views: {
      'menuContent': {
        templateUrl: 'pages/importFiles/importFiles.html',
        controller: 'importFilesCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
