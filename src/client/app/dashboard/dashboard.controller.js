(function() {
  'use strict';

  angular
    .module('app.dashboard')
    .controller('DashboardController', DashboardController);

  DashboardController.$inject = ['$scope', '$q', 'dataservice', '$http', '$timeout', '$mdDialog', 'logger'];
  /* @ngInject */
  function DashboardController($scope, $q, dataservice, $http, $timeout, $mdDialog, logger) {
    var vm = this;
    var progressChart;

    vm.title = 'Dashboard';

    var data = [
        // { requirement: 'transparency', link: 'http://imgur.com/aOtkeqT.png'},
        // { requirement: 'compliance', link: 'http://imgur.com/WhH7SYd.png'},
        // { requirement: 'commitment', link: 'http://imgur.com/rnYLMVC.png'},
        // { requirement: 'best practice', link: 'http://imgur.com/xVw0yQ2.png'},
        // { requirement: 'responsibility', link: 'http://imgur.com/GN9wzIb.png'},
        { requirement: 'employees', link: 'http://imgur.com/aTPVPVO.png'},
        // { requirement: 'development', link: 'http://imgur.com/d4SPWnS.png'},
        // { requirement: 'improvement', link: 'http://imgur.com/lMemDNl.png'}
      ];

    vm.evidenceTypes =  [
      { name: 'record', link: ' ' },
      { name: 'document', link: ' ' },
      { name: 'image(s)', link: ' ' },
      { name: 'map', link: ' ' },


    ]

    dataservice.getSmallholderCards(/* { status: dataservice.CARD_STATUS.COMPLETE } */)
      .then(function(data) {
        console.log(data);
        vm.data = data;
        createProgressChart();
        updateSmallholderProgress();
      });


      vm.updateProgress = function(req) {
        var newCard = dataservice.updateProgress(req.id);
        if (newCard.status === dataservice.CARD_STATUS.COMPLETE) {
          vm.showDialog(req);
        }
        updateSmallholderProgress();
      }

      vm.uploadDocument = function(id) {
        console.log(id);
      }

    function updateSmallholderProgress() {
        dataservice.getSmallholderProgress().then(function(progress) {
          console.log("Progress: ", progress);
          var chart = getProgressChart();
          chart.update([getRandomBest(), getRandomAvg(), progress]);
        });
    }

    function createProgressChart() {
      var colors = [
        '#89bf4a',
        '#fdb813',
        '#ee7813'
      ];

      d3.select('.status').selectAll('li')
        .data(data).enter()
        .append('li').on('mouseover', function (d) {
        })
        .append('div')
        .append('img').attr('src', function(d) {
          return d.link;
        })
        .attr('height', 35)
        .each(function (d, i) {
          d.series = [
            {
              value: getRandomBest(),
              color: colors[0]
            },
            {
              value: getRandomAvg(),
              color: colors[1]
            },
            {
              value: 0,
              color: colors[2]
            }
          ];
          getProgressChart(d, this.parentNode);
        });
    }

    function getProgressChart(data, parentNode) {
      if (!progressChart) {
        progressChart = new RadialProgressChart(parentNode, {
          max: 100,
          diameter: 500,
          shadow: {
            width: 0
          },
          stroke: {
            width: 100,
            gap: 20
          },
          series: data.series
        });
      }
      return progressChart;
    }

    function getProgressCircle(i) {
      return d3.select('.status').select('g').selectAll('g')[i];
    }

    var _best;
    // Random int between 20-80
    function getRandomBest() {
      if (!_best) {
        _best = Math.round(Math.random() * 30) + 70;
      }
      return _best;
    }
    var _avg;
    function getRandomAvg() {
      if (!_avg) {
        _avg = Math.round(Math.random() * 60) + 10;
      }
      return _avg;
    }

    vm.showDialog = function(req) {
       var parentEl = angular.element(document.body);
       $mdDialog.show({
         parent: parentEl,
         // targetEvent: $event,
         templateUrl: 'app/dashboard/partials/dialog.html',
         locals: {
           item: req
         },
         controller: DialogController
      });
      function DialogController($scope, $mdDialog, item) {
        console.log(item);
        $scope.item = item;
        $scope.closeDialog = function() {
          $mdDialog.hide();
        };
        $scope.uploadDocument = function(id) {
            dataservice.uploadDocument(id);
            item.uploadedDocument = true;
        }
      }
    };
  }
})();
