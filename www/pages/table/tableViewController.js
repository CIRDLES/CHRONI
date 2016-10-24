angular.module('chroni.controllers')

.controller('tableViewCtrl', function($scope, $ionicPlatform, $state, XML) {
    // this view's orientation is not locked
    $ionicPlatform.ready(function() {
        $scope.$on('$ionicView.beforeEnter', function() {
            window.screen.unlockOrientation();
        });
    });

    var tableArray = JSON.parse($state.params.tableArray);

    // claculates the colspan values for the first row of Categories
    $scope.firstRowColSpans = [];
    tableArray[1].forEach(function(categoryNames) {
        $scope.firstRowColSpans.push(categoryNames.length);
    });

    // alters the array so that it can be more easily placed within <th> tags
    var displayArray = tableArray;
    for (i = 0; i < displayArray.length; i++) {
        var category = displayArray[i];
        var newCategory = [];
        category.forEach(function(column) {
            column.forEach(function(item) {
                newCategory.push(item);
            })
        });
        displayArray[i] = newCategory;
    }

    $scope.headerArray = displayArray.slice(0, 4);
    $scope.fractionArray = displayArray.slice(4);


});
