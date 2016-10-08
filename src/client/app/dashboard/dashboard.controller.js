(function() {
  'use strict';

  angular
    .module('app.dashboard')
    .controller('DashboardController', DashboardController);

  DashboardController.$inject = ['$q', 'dataservice', 'logger'];
  /* @ngInject */
  function DashboardController($q, dataservice, logger) {
    var vm = this;

    vm.title = 'Dashboard';
    var data = [
        {link: 'http://imgur.com/aOtkeqT.png'},
        {link: 'http://imgur.com/WhH7SYd.png'},
        {link: 'http://imgur.com/rnYLMVC.png'},
        {link: 'http://imgur.com/xVw0yQ2.png'},
        {link: 'http://imgur.com/GN9wzIb.png'},
        {link: 'http://imgur.com/aTPVPVO.png'},
        {link: 'http://imgur.com/d4SPWnS.png'},
        {link: 'http://imgur.com/lMemDNl.png'}
      ];

    var colors = [
      "#2eb82e",
      "#ff9900",
      "#00ccff"
    ]

    d3.select('.status').selectAll('li')
      .data(data).enter()
      .append('li').on('mouseover', function (d) {
        console.log("hey")
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
  }
})();
