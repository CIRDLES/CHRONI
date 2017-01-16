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

        var calculateHeights = function(decrement) {
            // sets the height of the table body scroll view to fit the page properly
            var contentHeight = document.getElementById("tableContent").offsetHeight;
            var buttonDivHeight = document.getElementById("tableButtonDiv").offsetHeight;

            // uses decrement to differentiate between first openin and screen rotation
            $scope.headerHeight = document.getElementById("headScroll").offsetHeight - decrement;
            $scope.bodyScrollHeight = (contentHeight - buttonDivHeight - $scope.headerHeight);
        };

        $scope.$on('$ionicView.enter', function() {
            calculateHeights(0);
        });

        window.addEventListener("orientationchange", function() {
            $scope.headerHeight = 0;
            $scope.bodyScrollHeight = window.screen.height;
            $scope.$apply(calculateHeights(1));
        });

        // sets scrolling gestures
        var headerScrollEl = angular.element(document.getElementById("headScroll"));
        var mainBodyScrollEl = angular.element(document.getElementById("mainBodyScroll"));
        var leftBodyScrollEl = angular.element(document.getElementById("leftBodyScroll"));

        var headerScrollDel = $ionicScrollDelegate.$getByHandle("headScroll");
        var mainBodyScrollDel = $ionicScrollDelegate.$getByHandle("mainBodyScroll");
        var leftBodyScrollDel = $ionicScrollDelegate.$getByHandle("leftBodyScroll");

        $scope.headerScroll = function(event) {
            $scope.$apply(function() {
                // turns off the scrolling gesture for the main body and left body
                $ionicGesture.off($scope.mainBodyGesture, 'scroll', $scope.mainBodyScroll);
                $ionicGesture.off($scope.leftBodyGesture, 'scroll', $scope.leftBodyScroll);

                // scrolls the body with the header in the x direction
                mainBodyScrollDel.scrollTo(
                    headerScrollDel.getScrollPosition().left,
                    mainBodyScrollDel.getScrollPosition().top,
                    false
                );
            });
        }

        $scope.mainBodyScroll = function(event) {
            $scope.$apply(function() {
                // turns off the scrolling gesture for the header and left body
                $ionicGesture.off($scope.headerGesture, 'scroll', $scope.headerScroll);
                $ionicGesture.off($scope.leftBodyGesture, 'scroll', $scope.leftBodyScroll);

                var mainPosition = mainBodyScrollDel.getScrollPosition();

                // scrolls the header with the main body in the x direction
                headerScrollDel.scrollTo(
                    mainPosition.left,
                    headerScrollDel.getScrollPosition().top,
                    false
                );
                // scrolls the left body with the main body in the y direction
                leftBodyScrollDel.scrollTo(
                    leftBodyScrollDel.getScrollPosition().left,
                    mainPosition.top,
                    false
                );
            });
        }

        $scope.leftBodyScroll = function(event) {
            $scope.$apply(function() {
                // turns off the scrolling gesture for the header and main body
                $ionicGesture.off($scope.mainBodyGesture, 'scroll', $scope.mainBodyScroll);
                $ionicGesture.off($scope.headerGesture, 'scroll', $scope.headerScroll);

                // scrolls the main body with the left body in the y direction
                mainBodyScrollDel.scrollTo(
                    mainBodyScrollDel.getScrollPosition().left,
                    leftBodyScrollDel.getScrollPosition().top,
                    false
                );
            });
        }

        $scope.headerGesture = $ionicGesture.on("scroll", $scope.headerScroll, headerScrollEl);
        $scope.mainBodyGesture = $ionicGesture.on("scroll", $scope.mainBodyScroll, mainBodyScrollEl);
        $scope.leftBodyGesture = $ionicGesture.on("scroll", $scope.leftBodyScroll, leftBodyScrollEl);

        $scope.headerScrollReset = function() {
            // called when performing a header scroll to turn on the header scroll gesture
            $scope.headerGesture = $ionicGesture.on("scroll", $scope.headerScroll, headerScrollEl);
        }
        $scope.mainBodyScrollReset = function() {
            // called when performing a body scroll to turn on the body scroll gesture
            $scope.mainBodyGesture = $ionicGesture.on("scroll", $scope.mainBodyScroll, mainBodyScrollEl);
        }
        $scope.leftBodyScrollReset = function() {
            // called when performing a body scroll to turn on the body scroll gesture
            $scope.leftBodyGesture = $ionicGesture.on("scroll", $scope.leftBodyScroll, leftBodyScrollEl);
        }

    });

    // now calculates the data to be displayed in the table

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
            column.forEach(function(item, itemIndex) {
                if (item && item != "") {
                    // accounts for spaces, as HTML will remove them
                    if (i > 4 && item.includes(" ")) {
                        var re = new RegExp("\u0020", "g");
                        item = item.replace(re, "\u00A0");
                    }
                    newCategory.push(item);
                } else
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
