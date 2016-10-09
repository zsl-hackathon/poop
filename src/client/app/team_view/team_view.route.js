(function() {
  'use strict';

  angular
    .module('app.teamView')
    .run(appRun);

  appRun.$inject = ['routerHelper'];
  /* @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [
      {
        state: 'teamview',
        config: {
          url: '/',
          templateUrl: 'app/team_view/team_view.html',
          controller: 'TeamViewController',
          controllerAs: 'vm',
          title: 'teamview',
          settings: {
            nav: 1,
            content: '<i class="fa fa-dashboard"></i> Dashboard'
          }
        }
      }
    ];
  }
})();