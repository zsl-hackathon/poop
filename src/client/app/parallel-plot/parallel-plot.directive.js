/* jshint -W016 */
(function() {
    'use strict';

    angular
        .module('app.parallelplot')
        .directive('parallelPlot', parallelPlot);

    parallelPlot.$inject = ['common','config','d3', 'dataservice'];

    /* @ngInject */
    function parallelPlot (common, config, d3, dataservice) {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            bindToController: true,
            controller: ppchartController,
            controllerAs: 'vm',
            link: link,
            restrict: 'E',
            transclude: true,
            replace: true,
            templateUrl: 'app/parallel-plot/parallel-plot.html'
        };
        return directive;

        function link(scope, element, attrs, ctrl) {

            function buildChart(data) {
            }
        }
    }

    /* @ngInject */
    function ppchartController ($scope, config, d3, dataservice) {

        $scope.$on(config.events.startTunnels, function (e, tunnels) {
            if (tunnels) {
                var data = angular.copy(tunnels);
                data.forEach(function(d) {
                    delete d.portalWestId;
                    delete d.portalEastId;
                    delete d.tunnelSlope;
                    delete d.geom;
                    delete d.terrainGradient;
                    delete d.scarLength;

                });
                console.log('data', data);
                //var properties = getProperties(data);
                $scope.data =  data;
                $scope.dimensions = Object.keys($scope.data[0]);
                // console.log('dimensions', $scope.dimensions);
                // $scope.dimensions = filterDimensions();
                //choose a dimension to highlight on at random - not necessary. Just affects colours of chart.
                $scope.highlight = $scope.dimensions[(Math.random() * $scope.dimensions.length - 1) | 0];
                $scope.width = 1500;
                $scope.height = 170;
                // vm.tableData = tunnels;
                // console.log('populate Results', vm.tableData);
                // $scope.$apply();
            }
        });

        // $scope.$on(config.events.mapDrawn, function(event){
        //         dataservice
        //         .prime()
        //         .then(function() {
        //             //set up variables on the scope needed for the parallel plot                   
        //             var data = dataservice.lookupStoredData.alignment.features;
        //             var properties = getProperties(data);
        //             $scope.data =  properties;
        //             $scope.dimensions = Object.keys($scope.data[0]);
        //             //choose a dimension to highlight on at random - not necessary. Just affects colours of chart.
        //             $scope.highlight = $scope.dimensions[(Math.random() * $scope.dimensions.length - 1)|0];
        //             $scope.width = 1000;
        //             $scope.height = 150;
        //         });
        //     });

        //get the properties out of the objects. May not be necessary if data coming through is already only properties.
        function getProperties(data) {
            var properties = [];
            var i = 0;
            for (i = 0; i < data.length; i++) {
                properties.push(data[i]);
            }
            return properties;
        }

        function filterDimensions() {
            return ['id',
                    'buildingDistance',
                    'monumentDistance',
                    'constraintDistance',
                    'scarLength',
                    'terrainGradient',
                    'tunnelLength'];
        }
    }
})();
