angular.module('chroni.controllers')

.controller('viewFilesCtrl', function($scope, $ionicModal, $ionicPlatform, $cordovaFile, $cordovaToast, $ionicPopup, $ionicActionSheet, Settings, Files, History) {

    $scope.aliquot = Settings.get('lastAliquot');
    $scope.reportSettings = Settings.get('lastReportSettings');

    $scope.$watch('settings', function(v) {
        Settings.save();
    }, true);

    $scope.openTable = function() {
        var date = new Date();
        History.addItem($scope.aliquot, $scope.reportSettings, date);
    };

    var fs = new Files;

    $ionicPlatform.ready(function() {
        fs.getEntriesAtRoot()
            .then(function(result) {
                $scope.files = result;

            }, function(error) {
                console.error(error);
            });

        fs.getEntryAtPath(cordova.file.dataDirectory)
            .then(function(res) {
                $scope.currentDirectory = res;
            });

        $scope.select = function(path) {
            fs.getEntryAtPath(path)
                .then(function(result) {
                    if (result.isDirectory) {
                        getContents(path);

                    } else if (result.isFile) {
                        fs.checkFileValidity(result)
                            .then(function(fileType) {
                                if (fileType === "Aliquot" && $scope.modal.fileType === "Aliquot") {
                                    $scope.aliquot = result;
                                    $scope.closeModal();

                                } else if (fileType === "Report Settings" && $scope.modal.fileType === "Report Settings") {
                                    $scope.reportSettings = result;
                                    $scope.closeModal();
                                }
                            });
                    }
                });
        };

        getContents = function(path) {
            fs.getEntries(path)
                .then(function(result) {
                    $scope.files = result;
                    // only adds the parent option if not in top directory
                    if (path != cordova.file.dataDirectory) {
                        $scope.files.unshift({ name: "[parent]" });
                        fs.getParentDirectory(path)
                            .then(function(result) {
                                result.name = "[parent]";
                                $scope.files[0] = result;
                            });
                    }
                });
            fs.getEntryAtPath(path)
                .then(function(result) {
                    $scope.currentDirectory = result;
                });
        };

        $scope.$on('modal.hidden', function() {
            getContents(cordova.file.dataDirectory);
            if ($scope.inEdit) {
                $scope.toggleEdit();
            }
            if ($scope.copiedFile) {
                $scope.copyFile = null;
            }
            if ($scope.cutFile) {
                $scope.cutFile = null;
            }
        });
    });

    $ionicModal.fromTemplateUrl('pages/fileBrowser/fileBrowser.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.openModal = function(fileType) {
        $scope.modal.fileType = fileType;
        if (fileType === "Aliquot") {
            getContents(encodeURI(cordova.file.dataDirectory + "chroni/Aliquots"));

        } else if (fileType === "Report Settings") {
            getContents(encodeURI(cordova.file.dataDirectory + "chroni/Report Settings"));
        }
        $scope.modal.show();
    };

    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    $scope.showDelete = false;
    $scope.editText = "Edit";
    $scope.inEdit = false;

    $scope.toggleEdit = function() {
        $scope.showDelete = !$scope.showDelete;
        if ($scope.inEdit) {
            $scope.editText = "Edit";
        } else {
            $scope.editText = "Done";
        }
        $scope.inEdit = !$scope.inEdit;
    };

    $scope.deleteFile = function(files, file, index) {
        var path = file.fullPath;
        if (path[0] === "/") {
            path = path.substring(1, path.length);
        }

        if (file.isFile) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Delete File',
                template: '<p class="textCenter">Are you sure you want to delete this file?</p>',
                okText: "Delete",
                okType: "button-assertive"
            });

            confirmPopup.then(function(choice) {
                if (choice) {
                    fs.directoryContainsFileByPath(file, files)
                        .then(function(result) {
                            if (result) {
                                files.splice(index, 1);
                            }
                        });
                    $cordovaFile.removeFile(cordova.file.dataDirectory, path);
                }
            });

        } else {
            fs.isEmptyDirectory(cordova.file.dataDirectory + path)
                .then(function(isEmpty) {
                    if (isEmpty) {
                        var confirmPopup = $ionicPopup.confirm({
                            title: 'Delete Directory',
                            template: '<p class="textCenter">Are you sure you want to delete this directory?</p>',
                            okText: "Delete",
                            okType: "button-assertive"
                        });

                        confirmPopup.then(function(res) {
                            if (res) {
                                files.splice(index, 1);
                                $cordovaFile.removeDir(cordova.file.dataDirectory, path);
                            }
                        });

                    } else {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Cannot Delete',
                            template: '<p class="textCenter">The contents of this directory must be deleted first</p>'
                        });
                    }
                });
        }
    };

    $scope.copyFile = function(file) {
        if (file.isFile) {
            var path = file.fullPath;
            if (path[0] === "/") {
                path = path.substring(1, path.length);
            }
            if ($scope.fileCut) {
                $scope.fileCut = null;
            }
            $scope.copiedFile = file;
            $cordovaToast.showShortBottom("File copied to clipboard");

        } else {
            var alertPopup = $ionicPopup.alert({
                title: 'Cannot Copy Directory',
                template: '<p class="textCenter">A directory cannot be copied</p>'
            });
        }
    };

    $scope.cutFile = function(file) {
        if (file.isFile) {
            var path = file.fullPath;
            if (path[0] === "/") {
                path = path.substring(1, path.length);
            }
            if ($scope.copiedFile) {
                $scope.copiedFile = null;
            }
            $scope.fileCut = file;
            $cordovaToast.showShortBottom("File copied to clipboard");

        } else {
            var alertPopup = $ionicPopup.alert({
                title: 'Cannot Copy Directory',
                template: '<p class="textCenter">A directory cannot be copied</p>'
            });
        }
    };

    $scope.pasteFile = function(files, destinationDir) {
        var success = true;
        if ($scope.copiedFile) {
            fs.directoryContainsFileByName($scope.copiedFile, files)
                .then(function(result) {
                    if (!result) {
                        var path = $scope.copiedFile.fullPath;
                        if (path[0] === "/") {
                            path = path.substring(1, path.length);
                        }
                        var newPath = destinationDir.fullPath + $scope.copiedFile.name;
                        $cordovaFile.readAsText(cordova.file.dataDirectory, path)
                            .then(function(data) {
                                $cordovaFile.writeFile(cordova.file.dataDirectory, newPath, data, false)
                                    .then(function(succ) {})
                                    .then(function(error) {
                                        success = false;
                                    });
                            });
                        if (success) {
                            files.push($scope.copiedFile);
                        }
                    }
                });

        } else if ($scope.fileCut) {
            fs.directoryContainsFileByName($scope.fileCut, files)
                .then(function(result) {
                    if (!result) {
                        var path = $scope.fileCut.fullPath;
                        if (path[0] === "/") {
                            path = path.substring(1, path.length);
                        }
                        var newPath = destinationDir.fullPath + $scope.fileCut.name;
                        $cordovaFile.readAsText(cordova.file.dataDirectory, path)
                            .then(function(data) {
                                $cordovaFile.writeFile(cordova.file.dataDirectory, newPath, data, false)
                                    .then(function(succ) {
                                        $scope.fileCut = null;
                                    })
                                    .then(function(error) {
                                        success = false;
                                    });
                            });
                        if (success) {
                            $cordovaFile.removeFile(cordova.file.dataDirectory, path);
                            files.push($scope.fileCut);
                        }
                    }
                });

        } else {
            var alertPopup = $ionicPopup.alert({
                title: 'Cannot Paste',
                template: '<p class="textCenter">No file to paste</p>'
            });
        }

        if (!success) {
            var alertPopup = $ionicPopup.alert({
                title: 'Cannot Paste File',
                template: '<p class="textCenter">There was an error while attempting to paste this file</p>'
            });
        }
    };

    $scope.onFileHold = function(files, file, index) {
        if (file.isFile) {
            var actionSheet = $ionicActionSheet.show({
                buttons: [
                    { text: 'Cut' },
                    { text: 'Copy' }
                ],
                destructiveText: 'Delete',
                titleText: 'Modify File',
                cancelText: 'Cancel',
                buttonClicked: function(i) {
                    if (i === 0) {
                        $scope.cutFile(file);

                    } else if (i === 1) {
                        $scope.copyFile(file);
                    }
                    return true;
                },
                destructiveButtonClicked: function(i) {
                    $scope.deleteFile(files, file, index);
                    return true;
                }
            });
        };
    }

});
