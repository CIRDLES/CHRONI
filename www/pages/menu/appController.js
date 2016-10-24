angular.module('chroni.controllers')

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicPlatform, $cordovaFile, $cordovaFileTransfer, Files, Settings) {

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
    $ionicModal.fromTemplateUrl('pages/menu/login.html', {
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
        // this view's orientation is locked in portrait
        $scope.$on('$ionicView.beforeEnter', function() {
            window.screen.lockOrientation('portrait');
        });

        $cordovaFile.checkDir(cordova.file.dataDirectory, "chroni")
            .then(function(success) {},
                function(error) {
                    $cordovaFile.createDir(cordova.file.dataDirectory, "chroni", false);
                });

        $cordovaFile.checkDir(cordova.file.dataDirectory, "chroni/Aliquots")
            .then(function(success) {},
                function(error) {
                    $cordovaFile.createDir(cordova.file.dataDirectory, "chroni/Aliquots", false);
                });

        $cordovaFile.checkDir(cordova.file.dataDirectory, "chroni/Report Settings")
            .then(function(success) {},
                function(error) {
                    $cordovaFile.createDir(cordova.file.dataDirectory, "chroni/Report Settings", false);
                });

        $cordovaFile.checkFile(cordova.file.dataDirectory, "chroni/Report Settings/Default Report Settings.xml")
            .then(function(success) {},
                function(error) {
                    $cordovaFileTransfer.download(
                            "https://raw.githubusercontent.com/CIRDLES/cirdles.github.com/master/assets/Default Report Settings XML/Default Report Settings.xml",
                            encodeURI(cordova.file.dataDirectory + "chroni/Report Settings/Default Report Settings.xml"), {}, true)
                        .then(function(result) {},
                            function(err) {
                                console.log("ERROR: " + JSON.stringify(err));
                            },
                            function(progress) {});
                });

        $cordovaFile.checkFile(cordova.file.dataDirectory, "chroni/Aliquots/Default Aliquot.xml")
            .then(function(success) {},
                function(error) {
                    $cordovaFileTransfer.download(
                            "https://raw.githubusercontent.com/CIRDLES/cirdles.github.com/master/assets/Default-Aliquot-XML/Default Aliquot.xml",
                            encodeURI(cordova.file.dataDirectory + "chroni/Aliquots/Default Aliquot.xml"), {}, true)
                        .then(function(result) {},
                            function(err) {
                                console.log("ERROR: " + JSON.stringify(err));
                            },
                            function(progress) {});
                });

        $cordovaFile.checkFile(cordova.file.dataDirectory, "chroni/Report Settings/Default Report Settings 2.xml")
            .then(function(success) {},
                function(error) {
                    $cordovaFileTransfer.download(
                            "https://raw.githubusercontent.com/CIRDLES/cirdles.github.com/master/assets/Default Report Settings XML/Default Report Settings 2.xml",
                            encodeURI(cordova.file.dataDirectory + "chroni/Report Settings/Default Report Settings 2.xml"), {}, true)
                        .then(function(result) {},
                            function(err) {
                                console.log("ERROR: " + JSON.stringify(err));
                            },
                            function(progress) {});
                });

        var fs = new Files;
        var aliquot = "";
        var reportSettings = "";

        try {
            aliquot = Settings.get("lastAliquot");
        } catch (error) {}

        try {
            reportSettings = Settings.get("lastReportSettings");
        } catch (error) {}

        if (!aliquot || aliquot === "") {
            fs.getEntryAtPath(encodeURI(cordova.file.dataDirectory + "chroni/Aliquots/Default Aliquot.xml"))
                .then(function(result) {
                    Settings.set("lastAliquot", result);
                });
        }

        if (!reportSettings || reportSettings === "") {
            fs.getEntryAtPath(encodeURI(cordova.file.dataDirectory + "chroni/Report Settings/Default Report Settings.xml"))
                .then(function(result) {
                    Settings.set("lastReportSettings", result);
                });
        }

    });
});
