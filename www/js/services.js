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
.factory('Files', function($q) {

  var File = function() {};

  File.prototype = {

    getParentDirectory: function(path) {
      var deferred = $q.defer();
      window.resolveLocalFileSystemURI(path, function(fileSystem) {
        fileSystem.getParent(function(result) {
          deferred.resolve(result);
        }, function(error) {
          deferred.reject(error);
        });
      }, function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    },

    getEntriesAtRoot: function() {
      var deferred = $q.defer();
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
        var directoryReader = fileSystem.root.createReader();
        directoryReader.readEntries(function(entries) {
          deferred.resolve(entries);
        }, function(error) {
          deferred.reject(error);
        });
      }, function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    },

    getEntries: function(path) {
      var deferred = $q.defer();
      window.resolveLocalFileSystemURI(path, function(fileSystem) {
        var directoryReader = fileSystem.createReader();
        directoryReader.readEntries(function(entries) {
          deferred.resolve(entries);
        }, function(error) {
          deferred.reject(error);
        });
      }, function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    }

  };

  return File;

});
