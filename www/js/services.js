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
});
