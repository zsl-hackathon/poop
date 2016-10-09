(function() {
  'use strict';

  angular
    .module('app.layout')
    .directive('htTopNav', htTopNav);

  /* @ngInject */
  function htTopNav() {
    var directive = {
      bindToController: true,
      controller: TopNavController,
      controllerAs: 'vm',
      restrict: 'EA',
      scope: {
        'navline': '='
      },
      templateUrl: 'app/layout/ht-top-nav.html'
    };

    TopNavController.$inject = ['$scope', '$state'];

    /* @ngInject */
    function TopNavController($scope, $state) {
      var vm = this;
      $scope.isCollapsed = true;

      vm.goToTeamView = function(){
        // console.log('hello');
        $state.go('teamview')
      };
    }

    return directive;
  }
})();
