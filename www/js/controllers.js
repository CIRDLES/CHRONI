angular.module('chroni.controllers', ['ionic', 'chroni.services', 'ngCordova'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicPlatform, $cordovaFile, Settings) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});


  // Obtain data for the login modal
  $scope.loginData = {
    'username': Settings.get('username'),
    'password': Settings.get('password')
  };

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Logging in...', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  $ionicPlatform.ready(function() {
    $cordovaFile.checkDir(cordova.file.dataDirectory, "chroni")
      .then(function(success) {},
        function(error) {
          $cordovaFile.createDir(cordova.file.dataDirectory, "chroni", false);
        })

    $cordovaFile.checkDir(cordova.file.dataDirectory, "chroni/Aliquots")
      .then(function(success) {},
        function(error) {
          $cordovaFile.createDir(cordova.file.dataDirectory, "chroni/Aliquots", false);
        })

    $cordovaFile.checkDir(cordova.file.dataDirectory, "chroni/Report Settings")
      .then(function(success) {},
        function(error) {
          $cordovaFile.createDir(cordova.file.dataDirectory, "chroni/Report Settings", false);
        })
  })

})

.controller('homeCtrl', function($scope) {

})

.controller('viewFilesCtrl', function($scope, $ionicModal, $ionicPlatform, $cordovaFile, Settings, Files) {

  $scope.currentAliquot = Settings.get('currentAliquot');
  $scope.currentReportSettings = Settings.get('currentReportSettings');

  $scope.$watch('settings', function(v) {
    Settings.save();
  }, true);


  var fs = new Files;

  $ionicPlatform.ready(function() {
    $cordovaFile.createDir(cordova.file.dataDirectory, "newDir", false);
    $cordovaFile.createFile(cordova.file.dataDirectory, "newFile.txt", false);

    fs.getEntriesAtRoot().then(function(result) {
      $scope.files = result;
    }, function(error) {
      console.error(error);
    });

    $scope.getContents = function(path) {
      fs.getEntries(path)
        .then(function(result) {
          $scope.files = result;
          $scope.files.unshift({ name: "[parent]" });
          fs.getParentDirectory(path)
            .then(function(result) {
              result.name = "[parent]";
              $scope.files[0] = result;
            });
        });
    }
  });

  $ionicModal.fromTemplateUrl('templates/fileBrowser.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  })

  $scope.openModal = function() {
    $scope.modal.show();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

})

.controller('importFilesCtrl', function($scope) {

});
