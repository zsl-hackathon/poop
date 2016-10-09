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
          el.status = el['Smallholder/Group'] == CARD_OWNER_TYPE.NONE ? CARD_STATUS.COMPLETE : randomStatus();
          return el;
        });
    });

    var service = {
      getPeople: getPeople,
      getMessageCount: getMessageCount,
      getCards: getCards,
      getSmallholderCards: getSmallholderCards,
      getGroupCards: getGroupCards,
      updateProgress: updateProgress,
      getSmallholderProgress: getSmallholderProgress,
      getGroupProgress: getGroupProgress,
      CARD_STATUS: CARD_STATUS
    };

    return service;

    function getMessageCount() { return $q.when(72); }

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

    function getSmallholderProgress() {
      return getSmallholderCards().then(function(cards) {
        return getUserProgress(cards);
      });
    }
    function getGroupProgress() {
      return getGroupCards().then(function(cards) {
        return getUserProgress(cards);
      });
    }
    function getUserProgress(userCards) {
      return userCards.filter(function(card) {
        return card.status === CARD_STATUS.COMPLETE;
      }).length / userCards.length * 100;
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

    function getNextStatus(oldStatus) {
      return oldStatus === CARD_STATUS.TO_DO ? CARD_STATUS.IN_PROGRESS : oldStatus === CARD_STATUS.IN_PROGRESS ? CARD_STATUS.IN_REVIEW : CARD_STATUS.COMPLETE;
    }

    function updateProgress(cardId) {
      var index = cards.findIndex(function(card) {
        return card.id == cardId;
      });
      if (index != undefined && index != null) {
        cards[index].status = getNextStatus(cards[index].status);
        console.log("Card updated: ", cards[index]);
        return cards[index];
      }
      else {
        return exception.catcher('Card to update not found');
      }
    }
  }
})();
