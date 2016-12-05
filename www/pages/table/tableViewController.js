angular.module('chroni.controllers')

.controller('tableViewCtrl', function($scope, $ionicPlatform, $ionicScrollDelegate, $ionicGesture, $state) {
    // this view's orientation is not locked
    $ionicPlatform.ready(function() {
        $scope.$on('$ionicView.beforeEnter', function() {
            window.screen.unlockOrientation();
        });
        $scope.$on('$ionicView.beforeLeave', function() {
            window.screen.lockOrientation('portrait');
        });

        $scope.headerHeight = 0;
        $scope.bodyScrollHeight = window.screen.height;

        $scope.$on('$ionicView.enter', function() {
            // sets the height of the table body scroll view to fit the page properly
            var contentHeight = document.getElementById("tableContent").offsetHeight;
            var buttonDivHeight = document.getElementById("tableButtonDiv").offsetHeight;

            $scope.headerHeight = document.getElementById("headScroll").offsetHeight;
            $scope.bodyScrollHeight = (contentHeight - buttonDivHeight - $scope.headerHeight);
        });

        $scope.zoomLevel = 1;

        // sets scrolling gestures
        var headerScrollEl = angular.element(document.getElementById("headScroll"));
        var bodyScrollEl = angular.element(document.getElementById("bodyScroll"));

        $scope.headerScroll = function(event) {
            $scope.$apply(function() {
                // turns off the scrolling gesture for the body
                $ionicGesture.off($scope.bodyGesture, 'scroll', $scope.bodyScroll);

                var headerScrollDel = $ionicScrollDelegate.$getByHandle("headScroll");
                var bodyScrollDel = $ionicScrollDelegate.$getByHandle("bodyScroll");

                var position = headerScrollDel.getScrollPosition();

                // scrolls the body with the header in the x direction
                bodyScrollDel.scrollTo(
                    position.left,
                    bodyScrollDel.getScrollPosition().top,
                    false
                );
                bodyScrollDel.zoomTo(
                    position.zoom,
                    false
                );
                if (position.zoom !== $scope.zoomLevel) {
                    headerScrollDel.zoomTo(
                        position.zoom,
                        false
                    );
                    $scope.zoomLevel = position.zoom;

                    var contentHeight = document.getElementById("tableContent").offsetHeight;
                    var buttonDivHeight = document.getElementById("tableButtonDiv").offsetHeight;
                    var headerHeight = ($scope.headerHeight * $scope.zoomLevel) + .5;
                    $scope.bodyScrollHeight = (contentHeight - buttonDivHeight - headerHeight);
                    console.log($scope.bodyScrollHeight);

                }
            });
        }

        $scope.bodyScroll = function(event) {
            $scope.$apply(function() {
                // turns off the scrolling gesture for the header
                $ionicGesture.off($scope.headerGesture, 'scroll', $scope.headerScroll);

                var headerScrollDel = $ionicScrollDelegate.$getByHandle("headScroll");
                var bodyScrollDel = $ionicScrollDelegate.$getByHandle("bodyScroll");

                var position = bodyScrollDel.getScrollPosition();

                // scrolls the header with the body in the x direction
                headerScrollDel.scrollTo(
                    position.left,
                    headerScrollDel.getScrollPosition().top,
                    false
                );
                if (position.zoom !== $scope.zoomLevel) {
                    headerScrollDel.zoomTo(
                        position.zoom,
                        false
                    );
                    $scope.zoomLevel = position.zoom;
                }
            });
        }

        $scope.headerGesture = $ionicGesture.on("scroll", $scope.headerScroll, headerScrollEl);
        $scope.bodyGesture = $ionicGesture.on("scroll", $scope.bodyScroll, bodyScrollEl);

        $scope.headerScrollReset = function() {
            // called when performing a header scroll to turn on the header scroll gesture
            $scope.headerGesture = $ionicGesture.on("scroll", $scope.headerScroll, headerScrollEl);
        }

        $scope.bodyScrollReset = function() {
            // called when performing a body scroll to turn on the body scroll gesture
            $scope.bodyGesture = $ionicGesture.on("scroll", $scope.bodyScroll, bodyScrollEl);
        }

        // sets zooming gestures
        $scope.headerZoom = function() {
            var headerScrollDel = $ionicScrollDelegate.$getByHandle("headScroll");
            var bodyScrollDel = $ionicScrollDelegate.$getByHandle("bodyScroll");
            // zooms to body to the same level as head
            bodyScrollDel.zoomTo(
                headerScrollDel.getScrollPosition().zoom,
                false
            );
        }

        $scope.bodyZoom = function() {
            var headerScrollDel = $ionicScrollDelegate.$getByHandle("headScroll");
            var bodyScrollDel = $ionicScrollDelegate.$getByHandle("bodyScroll");
            // zooms to body to the same level as head
            headerScrollDel.zoomTo(
                bodyScrollDel.getScrollPosition().zoom,
                false
            );
        }

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
                if (item && item != "")
                    newCategory.push(item);
                else
                    // puts just a space in if the field is empty
                    newCategory.push("\u00A0");
            });
        });
        displayArray[i] = newCategory;
    }

    $scope.columnLengths = [];
    // first initializes all column lengths to 0 (uses the last row in header for this)
    for (i = 0; i < displayArray[3].length; i++) {
        $scope.columnLengths.push(0);
    }
    // steps through each row except top one (displayArray contains row arrays which contain columns)
    for (i = 1; i < displayArray.length; i++) {
        // steps through each column in the row
        for (j = 0; j < displayArray[i].length; j++) {
            if (displayArray[i][j].length > $scope.columnLengths[j]) {
                // the column contains a longer item than already found, updates lengths array
                $scope.columnLengths[j] = displayArray[i][j].length;
            }
        }
    }

    $scope.headerArray = displayArray.slice(0, 4);
    $scope.fractionArray = displayArray.slice(4);


});
