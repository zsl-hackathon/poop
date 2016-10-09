(function() {
'use strict';

    angular
        .module('app.teamView')
        .controller('TeamViewController', TeamViewController);

    TeamViewController.$inject = ['$scope', '$q', 'dataservice', '$http', '$timeout', '$mdDialog', 'logger'];
    function TeamViewController($scope, $q, dataservice, $http, $timeout, $mdDialog, logger) {
        var vm = this;

        vm.title = 'Team View';



        

        activate();

        ////////////////

        function activate() { 
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
        }

        function randomStatus() {

        var val = Math.random();

        return val < 0.25 ? 'To Do' : val < 0.5 ? 'In Progress' : val < 0.75 ? 'In Review' : 'Complete';

      }
    }
})();