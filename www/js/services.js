angular.module('chroni.services', ['ionic'])

/**
 * The Settings factory stores the user's data and settings, such as the current
 * aliquot and report settings files.
 */
.factory('Settings', function($rootScope) {
  var _settings = {};

  try {
    _settings = JSON.parse(window.localStorage['settings']);

  } catch (e) {}

  if (!_settings) {
    window.localStorage['settings'] = JSON.stringify(_settings);
  }

  var obj = {

    getSettings: function() {
      return _settings;
    },

    save: function() {
      window.localStorage['settings'] = JSON.stringify(_settings);
      $rootScope.$broadcast('settings.changed', _settings);
    },

    get: function(k) {
      return _settings[k];
    },

    set: function(k, v) {
      _settings[k] = v;
      this.save();
    }
  };

  obj.save();
  return obj;
})

/**
 * The Files factory stores the users' files, such as aliquot and report settings
 * files.
 *
 */
.factory('Files', function($q, $cordovaFile) {

  var File = function() {};

  File.prototype = {

    getParentDirectory: function(path) {
      var deferred = $q.defer();
      window.resolveLocalFileSystemURL(path,
        function(fileSystem) {
          fileSystem.getParent(function(result) {
            deferred.resolve(result);
          }, function(error) {
            deferred.reject(error);
          });
        },
        function(error) {
          deferred.reject(error);
        });
      return deferred.promise;
    },

    getEntriesAtRoot: function() {
      var deferred = $q.defer();
      window.resolveLocalFileSystemURL(cordova.file.dataDirectory,
        function(fileSystem) {
          var directoryReader = fileSystem.createReader();
          directoryReader.readEntries(function(entries) {
            deferred.resolve(entries);
          }, function(error) {
            deferred.reject(error);
          });
        },
        function(error) {
          deferred.reject(error);
        });
      return deferred.promise;
    },

    getEntries: function(path) {
      var deferred = $q.defer();
      window.resolveLocalFileSystemURL(path,
        function(fileSystem) {
          var directoryReader = fileSystem.createReader();
          directoryReader.readEntries(function(entries) {
            deferred.resolve(entries);
          }, function(error) {
            deferred.reject(error);
          });
        },
        function(error) {
          deferred.reject(error);
        });
      return deferred.promise;
    },

    getEntryAtPath: function(path) {
      var deferred = $q.defer();
      window.resolveLocalFileSystemURL(path,
        function(fileSystem) {
          deferred.resolve(fileSystem);
        },
        function(error) {
          deferred.reject(error)
        });
      return deferred.promise;
    },

    checkFileValidity: function(file) {
      // if valid, returns the type of XML file
      var deferred = $q.defer();
      var x2js = new X2JS();

      path = file.fullPath;
      if (path[0] === "/") {
        path = path.substring(1, path.length);
      }

      $cordovaFile.readAsText(cordova.file.dataDirectory, path)
        .then(function(result) {
            var jsonObj = x2js.xml_str2json(result);
            if (jsonObj) {
              if (jsonObj["Aliquot"]) {
                deferred.resolve("Aliquot");

              } else if (jsonObj["ReportSettings"]) {
                deferred.resolve("Report Settings");
              }
            }
          },
          function(error) {
            deferred.reject(error);
          });

      return deferred.promise;
    },

    createAndWriteFile: function(path, data) {
      var deferred = $q.defer();
      var success = false;
      $cordovaFile.createFile(cordova.file.dataDirectory, path, false)
        .then(function(result) {
          $cordovaFile.writeFile(cordova.file.dataDirectory, path, data, false)
            .then(function() {

            });
        });
      return deferred.promise;
    },

    isEmptyDirectory: function(path) {
      var deferred = $q.defer();
      window.resolveLocalFileSystemURL(path,
        function(fileSystem) {
          var directoryReader = fileSystem.createReader();
          directoryReader.readEntries(function(entries) {
            deferred.resolve(entries.length === 0);
          }, function(error) {
            deferred.reject(error);
          });
        },
        function(error) {
          deferred.reject(error);
        });
      return deferred.promise;
    },

    directoryContainsFileByPath: function(file, files) {
      var deferred = $q.defer();
      var found = false;
      var i = 0;
      while (!found && i < files.length) {
        if (file.fullPath === files[i].fullPath) {
          found = true;
        }
        i++;
      }
      deferred.resolve(found);
      return deferred.promise;
    },

    directoryContainsFileByName: function(file, files) {
      var deferred = $q.defer();
      var found = false;
      var i = 0;
      while (!found && i < files.length) {
        if (file.name === files[i].name) {
          found = true;
        }
        i++;
      }
      deferred.resolve(found);
      return deferred.promise;
    }
  };

  return File;

});
