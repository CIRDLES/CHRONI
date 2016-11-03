angular.module('chroni.controllers')

.controller('aboutCtrl', function($scope, $ionicPlatform) {
    // this view's orientation is locked in portrait
    $ionicPlatform.ready(function() {
        $scope.$on('$ionicView.beforeEnter', function() {
            window.screen.lockOrientation('portrait');
        });
    });

});
