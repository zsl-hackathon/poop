(function() {
  'use strict';

  angular
    .module('app.dashboard')
    .controller('DashboardController', DashboardController);

  DashboardController.$inject = ['$q', 'dataservice', '$http', 'logger'];
  /* @ngInject */
  function DashboardController($q, dataservice, $http, logger) {
    var vm = this;
console.log("loaded");
    vm.title = 'Dashboard';

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

        return val < 0.25 ? 'todo' : val < 0.5 ? 'in progress' : val < 0.75 ? 'in review' : 'complete';

      }

      vm.updateProgress = function(req) {
        var index = vm.data.map(function(el) { return el.id }).indexOf(req.id);

        var newStatus = req.status === 'todo' ? 'in progress' : req.status === 'in progress' ? 'in review' : 'complete';

        vm.data[index].status = newStatus;
      }


  }
})();
