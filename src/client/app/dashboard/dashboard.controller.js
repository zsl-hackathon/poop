(function() {
  'use strict';

  angular
    .module('app.dashboard')
    .controller('DashboardController', DashboardController);

  DashboardController.$inject = ['$scope', '$q', 'dataservice', '$http', '$timeout', '$mdDialog', 'logger'];
  /* @ngInject */
  function DashboardController($scope, $q, dataservice, $http, $timeout, $mdDialog, logger) {
    var vm = this;

    vm.title = 'Dashboard';

    var data = [
        { requirement: 'transparency', link: 'http://imgur.com/aOtkeqT.png'},
        { requirement: 'compliance', link: 'http://imgur.com/WhH7SYd.png'},
        { requirement: 'commitment', link: 'http://imgur.com/rnYLMVC.png'},
        { requirement: 'best practice', link: 'http://imgur.com/xVw0yQ2.png'},
        { requirement: 'responsibility', link: 'http://imgur.com/GN9wzIb.png'},
        { requirement: 'employees', link: 'http://imgur.com/aTPVPVO.png'},
        { requirement: 'development', link: 'http://imgur.com/d4SPWnS.png'},
        { requirement: 'improvement', link: 'http://imgur.com/lMemDNl.png'}
      ];

    vm.icons = data;

    $http.get('data/RSPO_Principle2.json')
      .then(function(result) {

        var data = result.data;

        data = data.map(function(el) {
          el.status = randomStatus();
          return el;
        });

        console.log(data);

        vm.data = data;

      });


      function randomStatus() {

        var val = Math.random();

        return val < 0.25 ? 'To Do' : val < 0.5 ? 'In Progress' : val < 0.75 ? 'In Review' : 'Complete';

      }

      vm.updateProgress = function(req) {
        var index = vm.data.map(function(el) { return el.id }).indexOf(req.id);

        var newStatus = req.status === 'To Do' ? 'In Progress' : req.status === 'In Progress' ? 'In Review' : 'Complete';

        // $timeout(function() {
          vm.data[index].status = newStatus;
        // }, 500);

        if (newStatus === 'Complete') {
          vm.showDialog(req);
        }
      }

    var colors = [
      "#2eb82e",
      "#ff9900",
      "#00ccff"
    ]

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
          value: getRandomYou(),
          color: colors[2]
        }
      ];
      new RadialProgressChart(this.parentNode, {
        max: 100,
        diameter: 30,
        shadow: {
          width: 0
        },
        stroke: {
          width: 6,
          gap: 2
        },
        series: d.series
      });
    });

    // Random int between 20-80
    function getRandomBest() {
      return Math.round(Math.random() * 30) + 70;
    }
    function getRandomAvg() {
      return Math.round(Math.random() * 60) + 10;
    }
    function getRandomYou() {
      return Math.round(Math.random() * 40) + 30;
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
        }
      }
    }

  }
})();
