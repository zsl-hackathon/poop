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

                    var gauge1 = loadLiquidFillGauge("fillgauge1", 55);
                    var config1 = liquidFillGaugeDefaultSettings();
                    config1.circleColor = "#FF7777";
                    config1.textColor = "#FF4444";
                    config1.waveTextColor = "#FFAAAA";
                    config1.waveColor = "#FFDDDD";
                    config1.circleThickness = 0.2;
                    config1.textVertPosition = 0.2;
                    config1.waveAnimateTime = 1000;

                    console.log(data);

                    vm.data = data;

                });
        }


    dataservice.getGroupCards(/* { status: dataservice.CARD_STATUS.COMPLETE } */)
      .then(function(data) {
        console.log("MANAGER: ", data);
        vm.data = data;
      });

        function randomStatus() {

        var val = Math.random();

        return val < 0.25 ? 'To Do' : val < 0.5 ? 'In Progress' : val < 0.75 ? 'In Review' : 'Complete';

      }
    }
})();
