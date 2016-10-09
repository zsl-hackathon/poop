/* jshint -W016 */
(function() {
    'use strict';

    angular
        .module('app.parallelplot')
        .directive('parallelPlot', parallelPlot);

    parallelPlot.$inject = ['config','d3', 'dataservice'];

    /* @ngInject */
    function parallelPlot (config, d3, dataservice) {
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

      dataservice.getProgressData()

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
