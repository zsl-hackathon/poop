(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('dataservice', dataservice);

  dataservice.$inject = ['$http', '$q', 'exception', 'logger'];
  /* @ngInject */
  function dataservice($http, $q, exception, logger) {
    var cards;
    var CARD_STATUS = {
      TO_DO: "To Do",
      IN_PROGRESS: "In Progress",
      IN_REVIEW: "In Review",
      COMPLETE: "Complete"
    };
    var CARD_OWNER_TYPE = {
      GROUP: "Group",
      SMALLHOLDER: "Smallholder",
      NONE: "-"
    };
    var cardsRetriever = $http.get('data/RSPO_Principle2.json').then(function(result) {
        var data = result.data;

        function randomStatus() {
          var val = Math.random();
          return val < 0.5 ? CARD_STATUS.TO_DO : val < 0.65 ? CARD_STATUS.IN_PROGRESS : val < 0.80 ? CARD_STATUS.IN_REVIEW : CARD_STATUS.COMPLETE;
        }

        cards = data.map(function(el) {
          el.status = el['Smallholder/Group'] == '-' ? CARD_STATUS.COMPLETE : randomStatus();
          return el;
        });
    });

    var service = {
      getProgressData: getProgressData,
      getPeople: getPeople,
      getMessageCount: getMessageCount,
      getCards: getCards,
      getSmallholderCards: getSmallholderCards,
      getGroupCards: getGroupCards,
      CARD_STATUS: CARD_STATUS
    };

    return service;

    function getMessageCount() { return $q.when(72); }

    function getProgressData() {
      $http.get('/data/progress_data.csv')
      .then(function(res) {
        console.log(res);
      });
    }

    function getPeople() {
      return $http.get('/api/people')
        .then(success)
        .catch(fail);

      function success(response) {
        return response.data;
      }

      function fail(e) {
        return exception.catcher('XHR Failed for getPeople')(e);
      }
    }

    function isFunction(functionToCheck) {
      var getType = {};
      return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    function findByMatchingProperties(arr, properties) {
      return arr.filter(function (entry) {
        return Object.keys(properties).every(function (key) {
          if (isFunction(properties[key])) {
            return properties[key](entry[key]);
          }
          return entry[key] === properties[key];
        });
      });
    }

    function getSmallholderCards(filterBy) {
      filterBy = filterBy || {};
      filterBy['Smallholder/Group'] = function(v) {
        return v == CARD_OWNER_TYPE.SMALLHOLDER || v == CARD_OWNER_TYPE.NONE;
      };
      return getCards(filterBy);
    }

    function getGroupCards(filterBy) {
      filterBy = filterBy || {};
      filterBy['Smallholder/Group'] = function(v) {
        return v == CARD_OWNER_TYPE.GROUP || v == CARD_OWNER_TYPE.NONE;
      };
      return getCards(filterBy);
    }

    function getCards(filterBy) {
      return cardsRetriever.then(function() {
        return findByMatchingProperties(cards, filterBy || {});
      });
    }
  }
})();
