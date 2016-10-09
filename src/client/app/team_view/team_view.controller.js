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
                    vm.data = data;

                });
        }

        function RadarChart(id, data, options) {
          var cfg = {
           w: 600,        //Width of the circle
           h: 600,        //Height of the circle
           margin: {top: 40, right: 40, bottom: 40, left: 40}, //The margins of the SVG
           levels: 3,       //How many levels or inner circles should there be drawn
           maxValue: 0,       //What is the value that the biggest circle will represent
           labelFactor: 1.25,   //How much farther than the radius of the outer circle should the labels be placed
           wrapWidth: 60,     //The number of pixels after which a label needs to be given a new line
           opacityArea: 0.35,   //The opacity of the area of the blob
           dotRadius: 4,      //The size of the colored circles of each blog
           opacityCircles: 0.1,   //The opacity of the circles of each blob
           strokeWidth: 2,    //The width of the stroke around each blob
           roundStrokes: false, //If true the area and stroke will follow a round path (cardinal-closed)
           color: d3.scale.category10() //Color function
          };


        dataservice.getGroupCards(/* { status: dataservice.CARD_STATUS.COMPLETE } */)
        .then(function(data) {
            console.log("MANAGER: ", data);
            vm.data = data;
        });

 //Put all of the options into a variable called cfg
          if('undefined' !== typeof options){
            for(var i in options){
              if('undefined' !== typeof options[i]){ cfg[i] = options[i];
              }
            }//for i
          }//if


          //If the supplied maxValue is smaller than the actual one, replace by the max in the data
          var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));
          maxValue = 1;

          var allAxis = (data[0].map(function(i, j){return {"axis":i.axis,"image":i.image}})),  //Names of each axis
            total = allAxis.length,         //The number of different axes
            radius = Math.min(cfg.w/2, cfg.h/2),  //Radius of the outermost circle
            Format = d3.format('%'),        //Percentage formatting
            angleSlice = Math.PI * 2 / total;   //The width in radians of each "slice"

          //Scale for the radius
          var rScale = d3.scale.linear()
            .range([0, radius])
            .domain([0, maxValue]);

          /////////////////////////////////////////////////////////
          //////////// Create the container SVG and g /////////////
          /////////////////////////////////////////////////////////

          //Remove whatever chart with the same id/class was present before
          d3.select(id).select("svg").remove();

          //Initiate the radar chart SVG
          var svg = d3.select(id).append("svg")
              .attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
              .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
              .attr("class", "radar"+id);
          //Append a g element
          var g = svg.append("g")
              .attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");

          /////////////////////////////////////////////////////////
          ////////// Glow filter for some extra pizzazz ///////////
          /////////////////////////////////////////////////////////

          //Filter for the outside glow
          var filter = g.append('defs').append('filter').attr('id','glow'),
            feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
            feMerge = filter.append('feMerge'),
            feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
            feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

          /////////////////////////////////////////////////////////
          /////////////// Draw the Circular grid //////////////////
          /////////////////////////////////////////////////////////

          //Wrapper for the grid & axes
          var axisGrid = g.append("g").attr("class", "axisWrapper");

          //Draw the background circles
          axisGrid.selectAll(".levels")
             .data(d3.range(1,(cfg.levels+1)).reverse())
             .enter()
            .append("circle")
            .attr("class", "gridCircle")
            .attr("r", function(d, i){return radius/cfg.levels*d;})
            .style("fill", "#CDCDCD")
            .style("stroke", "#CDCDCD")
            .style("fill-opacity", cfg.opacityCircles)
            .style("filter" , "url(#glow)");

          //Text indicating at what % each level is
          axisGrid.selectAll(".axisLabel")
             .data(d3.range(1,(cfg.levels+1)).reverse())
             .enter().append("text")
             .attr("class", "axisLabel")
             .attr("x", 4)
             .attr("y", function(d){return -d*radius/cfg.levels;})
             .attr("dy", "0.4em")
             .style("font-size", "10px")
             .attr("fill", "#737373")
             .text(function(d,i) { return Format(maxValue * d/cfg.levels); });

          /////////////////////////////////////////////////////////
          //////////////////// Draw the axes //////////////////////
          /////////////////////////////////////////////////////////

          //Create the straight lines radiating outward from the center
          var axis = axisGrid.selectAll(".axis")
            .data(allAxis)
            .enter()
            .append("g")
            .attr("class", "axis");
          //Append the lines
          axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
            .attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
            .attr("class", "line")
            .style("stroke", "white")
            .style("stroke-width", "2px");

          //Append the labels at each axis

           axis
           .append("image")
                .attr("xlink:href", function(d) { return "https://files.slack.com/files-pri/T2M0U3KBQ-F2M2R9Z6Z/" + d.image + ".png"; })
                .attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor * 1.3) * Math.cos(angleSlice*i - Math.PI/2) - 20; })
            .attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor * 1.3) * Math.sin(angleSlice*i - Math.PI/2) - 20; })
                .attr("width", "40")
                .attr("height", "40");

          axis.append("text")
            .attr("class", "legend")
            .style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", "0em")
            .attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor * 1) * Math.cos(angleSlice*i - Math.PI/2); })
            .attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor * 1 ) * Math.sin(angleSlice*i - Math.PI/2); })
            .text(function(d){return d.axis })
            .call(wrap, cfg.wrapWidth);




          /////////////////////////////////////////////////////////
          ///////////// Draw the radar chart blobs ////////////////
          /////////////////////////////////////////////////////////

          //The radial line function
          var radarLine = d3.svg.line.radial()
            .interpolate("linear-closed")
            .radius(function(d) { return rScale(d.value); })
            .angle(function(d,i) {  return i*angleSlice; });

          if(cfg.roundStrokes) {
            radarLine.interpolate("cardinal-closed");
          }

          //Create a wrapper for the blobs
          var blobWrapper = g.selectAll(".radarWrapper")
            .data(data)
            .enter().append("g")
            .attr("class", "radarWrapper");

          //Append the backgrounds
          blobWrapper
            .append("path")
            .attr("class", "radarArea")
            .attr("d", function(d,i) { return radarLine(d); })
            .style("fill", function(d,i) { return cfg.color(i); })
            .style("fill-opacity", cfg.opacityArea)
            .on('mouseover', function (d,i){
              //Dim all blobs
              d3.selectAll(".radarArea")
                .transition().duration(200)
                .style("fill-opacity", 0.1);
              //Bring back the hovered over blob
              d3.select(this)
                .transition().duration(200)
                .style("fill-opacity", 0.7);
            })
            .on('mouseout', function(){
              //Bring back all blobs
              d3.selectAll(".radarArea")
                .transition().duration(200)
                .style("fill-opacity", cfg.opacityArea);
            });

          //Create the outlines
          blobWrapper.append("path")
            .attr("class", "radarStroke")
            .attr("d", function(d,i) { return radarLine(d); })
            .style("stroke-width", cfg.strokeWidth + "px")
            .style("stroke", function(d,i) { return cfg.color(i); })
            .style("fill", "none")
            .style("filter" , "url(#glow)");

          //Append the circles
          blobWrapper.selectAll(".radarCircle")
            .data(function(d,i) { return d; })
            .enter().append("circle")
            .attr("class", "radarCircle")
            .attr("r", cfg.dotRadius)
            .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
            .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
            .style("fill", function(d,i,j) { return cfg.color(j); })
            .style("fill-opacity", 0.8);

          /////////////////////////////////////////////////////////
          //////// Append invisible circles for tooltip ///////////
          /////////////////////////////////////////////////////////

          //Wrapper for the invisible circles on top
          var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
            .data(data)
            .enter().append("g")
            .attr("class", "radarCircleWrapper");

          //Append a set of invisible circles on top for the mouseover pop-up
          blobCircleWrapper.selectAll(".radarInvisibleCircle")
            .data(function(d,i) { return d; })
            .enter().append("circle")
            .attr("class", "radarInvisibleCircle")
            .attr("r", cfg.dotRadius*1.5)
            .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
            .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", function(d,i) {
              newX =  parseFloat(d3.select(this).attr('cx')) - 10;
              newY =  parseFloat(d3.select(this).attr('cy')) - 10;

              tooltip
                .attr('x', newX)
                .attr('y', newY)
                .text(Format(d.value))
                .transition().duration(200)
                .style('opacity', 1);
            })
            .on("mouseout", function(){
              tooltip.transition().duration(200)
                .style("opacity", 0);
            });

          //Set up the small tooltip for when you hover over a circle
          var tooltip = g.append("text")
            .attr("class", "tooltip")
            .style("opacity", 0);

          /////////////////////////////////////////////////////////
          /////////////////// Helper Function /////////////////////
          /////////////////////////////////////////////////////////

          //Taken from http://bl.ocks.org/mbostock/7555321
          //Wraps SVG text
          function wrap(text, width) {
            text.each(function() {
            var text = d3.select(this),
              words = text.text().split(/\s+/).reverse(),
              word,
              line = [],
              lineNumber = 0,
              lineHeight = 1.4, // ems
              y = text.attr("y"),
              x = text.attr("x"),
              dy = parseFloat(text.attr("dy")),
              tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

            while (word = words.pop()) {
              line.push(word);
              tspan.text(line.join(" "));
              if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
              }
            }
            });
          }//wrap

        }//RadarChart



        var margin = {top: 140, right: 100, bottom: 140, left: 100},
        width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
          height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

        //////////////////////////////////////////////////////////////
        ////////////////////////// Data //////////////////////////////
        //////////////////////////////////////////////////////////////

        var data = [
          [//iPhone
          {axis:"Transparency",value:0.22, image:"p1"},
          {axis:"Laws and regulations",value:0.28, image:"p2"},
          {axis:"Finance",value:0.79, image:"p3"},
          {axis:"Best Practice",value:0.17, image:"p4"},
          {axis:"Environment",value:0.22, image:"p5"},
          {axis:"Communities",value:0.82, image:"p6"},
          {axis:"New developments",value:0.21, image:"p7"},
          {axis:"Continuous Improvement",value:0.50, image:"p8"}
          ],[//Samsung
          {axis:"Transparency",value:0.93, image:"p1"},
          {axis:"Brand",value:0.16, image:"p2"},
          {axis:"Contract Cost",value:0.35, image:"p3"},
          {axis:"Design And Quality",value:0.13, image:"p4"},
          {axis:"Have Internet Connectivity",value:0.20, image:"p5"},
          {axis:"Large Screen",value:0.13,image:"p6"},
          {axis:"Price Of Device",value:0.35,image:"p7"},
          {axis:"To Be A Smartphone",value:0.38,image:"p8"}
          ]
        ];
        //////////////////////////////////////////////////////////////
        //////////////////// Draw the Chart //////////////////////////
        //////////////////////////////////////////////////////////////

        var color = d3.scale.ordinal()
          .range(["#EDC951","#CC333F","#00A0B0"]);

        var radarChartOptions = {
          w: width,
          h: height,
          margin: margin,
          maxValue: 0.5,
          levels: 5,
          roundStrokes: true,
          color: color
        };
        //Call function to draw the Radar chart
        RadarChart(".radarChart", data, radarChartOptions);


      dataservice.getGroupCards(/* { status: dataservice.CARD_STATUS.COMPLETE } */)
        .then(function(data) {
          vm.data = data;
      });

      function randomStatus() {
        var val = Math.random();
        return val < 0.25 ? 'To Do' : val < 0.5 ? 'In Progress' : val < 0.75 ? 'In Review' : 'Complete';

        } 

         function runGauge() {
            d3.select("#liquid_space").append("svg").attr("id", "fillgauge1").attr("height", "300px").attr("margin-right", "100px");
            var gauge1 = loadLiquidFillGauge("fillgauge1", 55);
            var config1 = liquidFillGaugeDefaultSettings();
            config1.circleColor = "#FF7777";
            config1.textColor = "#FF4444";
            config1.waveTextColor = "#FFAAAA";
            config1.waveColor = "#FFDDDD";
            config1.circleThickness = 0.2;
            config1.textVertPosition = 0.2;
            config1.waveAnimateTime = 1000;
            var gauge2= loadLiquidFillGauge("fillgauge2", 28, config1);
           

            function NewValue(){
                if(Math.random() > .5){
                    return Math.round(Math.random()*100);
                } else {
                    return (Math.random()*100).toFixed(1);
                }
            }
        }

        function liquidFillGaugeDefaultSettings(){
        return {
            minValue: 0, // The gauge minimum value.
            maxValue: 100, // The gauge maximum value.
            circleThickness: 0.05, // The outer circle thickness as a percentage of it's radius.
            circleFillGap: 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
            circleColor: "#89bf4a", // The color of the outer circle.
            waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
            waveCount: 1, // The number of full waves per width of the wave circle.
            waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
            waveAnimateTime: 5000, // The amount of time in milliseconds for a full wave to enter the wave circle.
            waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
            waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
            waveAnimate: true, // Controls if the wave scrolls or is static.
            waveColor: "#89bf4a", // The color of the fill wave.
            waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
            textVertPosition: .5, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
            textSize: 1, // The relative height of the text to display in the wave circle. 1 = 50%
            valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
            displayPercent: true, // If true, a % symbol is displayed after the value.
            textColor: "#2b2b2b", // The color of the value text when the wave does not overlap it.
            waveTextColor: "#e7e7e7" // The color of the value text when the wave overlaps it.
        };
    }

    function loadLiquidFillGauge(elementId, value, config) {
        if(config == null) config = liquidFillGaugeDefaultSettings();

        var gauge = d3.select("#" + elementId);
        // console.log(gauge.style("width"));
        var radius = 120;
        var locationX = parseInt(250)/2 - radius;
        var locationY = parseInt(250)/2 - radius;
        var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value))/config.maxValue;

        var waveHeightScale;
        if(config.waveHeightScaling){
            waveHeightScale = d3.scale.linear()
                .range([0,config.waveHeight,0])
                .domain([0,50,100]);
        } else {
            waveHeightScale = d3.scale.linear()
                .range([config.waveHeight,config.waveHeight])
                .domain([0,100]);
        }

        var textPixels = (config.textSize*radius/2);
        var textFinalValue = parseFloat(value).toFixed(2);
        var textStartValue = config.valueCountUp?config.minValue:textFinalValue;
        var percentText = config.displayPercent?"%":"";
        var circleThickness = config.circleThickness * radius;
        var circleFillGap = config.circleFillGap * radius;
        var fillCircleMargin = circleThickness + circleFillGap;
        var fillCircleRadius = radius - fillCircleMargin;
        var waveHeight = fillCircleRadius*waveHeightScale(fillPercent*100);

        var waveLength = fillCircleRadius*2/config.waveCount;
        var waveClipCount = 1+config.waveCount;
        var waveClipWidth = waveLength*waveClipCount;

        // Rounding functions so that the correct number of decimal places is always displayed as the value counts up.
        var textRounder = function(value){ return Math.round(value); };
        if(parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))){
            textRounder = function(value){ return parseFloat(value).toFixed(1); };
        }
        if(parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))){
            textRounder = function(value){ return parseFloat(value).toFixed(2); };
        }

        // Data for building the clip wave area.
        var data = [];
        for(var i = 0; i <= 40*waveClipCount; i++){
            data.push({x: i/(40*waveClipCount), y: (i/(40))});
        }

        // Scales for drawing the outer circle.
        var gaugeCircleX = d3.scale.linear().range([0,2*Math.PI]).domain([0,1]);
        var gaugeCircleY = d3.scale.linear().range([0,radius]).domain([0,radius]);

        // Scales for controlling the size of the clipping path.
        var waveScaleX = d3.scale.linear().range([0,waveClipWidth]).domain([0,1]);
        var waveScaleY = d3.scale.linear().range([0,waveHeight]).domain([0,1]);

        // Scales for controlling the position of the clipping path.
        var waveRiseScale = d3.scale.linear()
            // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
            // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
            // circle at 100%.
            .range([(fillCircleMargin+fillCircleRadius*2+waveHeight),(fillCircleMargin-waveHeight)])
            .domain([0,1]);
        var waveAnimateScale = d3.scale.linear()
            .range([0, waveClipWidth-fillCircleRadius*2]) // Push the clip area one full wave then snap back.
            .domain([0,1]);

        // Scale for controlling the position of the text within the gauge.
        var textRiseScaleY = d3.scale.linear()
            .range([fillCircleMargin+fillCircleRadius*2,(fillCircleMargin+textPixels*0.7)])
            .domain([0,1]);

        // Center the gauge within the parent SVG.
        var gaugeGroup = gauge.append("g")
            .attr('transform','translate('+locationX+','+locationY+')');

        // Draw the outer circle.
        var gaugeCircleArc = d3.svg.arc()
            .startAngle(gaugeCircleX(0))
            .endAngle(gaugeCircleX(1))
            .outerRadius(gaugeCircleY(radius))
            .innerRadius(gaugeCircleY(radius-circleThickness));
        gaugeGroup.append("path")
            .attr("d", gaugeCircleArc)
            .style("fill", config.circleColor)
            .attr('transform','translate('+radius+','+radius+')');

        // Text where the wave does not overlap.
        var text1 = gaugeGroup.append("text")
            .text(textRounder(textStartValue) + percentText)
            .attr("class", "liquidFillGaugeText")
            .attr("text-anchor", "middle")
            .attr("font-size", textPixels + "px")
            .style("fill", config.textColor)
            .attr('transform','translate('+radius+','+textRiseScaleY(config.textVertPosition)+')');

        // The clipping wave area.
        var clipArea = d3.svg.area()
            .x(function(d) { return waveScaleX(d.x); } )
            .y0(function(d) { return waveScaleY(Math.sin(Math.PI*2*config.waveOffset*-1 + Math.PI*2*(1-config.waveCount) + d.y*2*Math.PI));} )
            .y1(function(d) { return (fillCircleRadius*2 + waveHeight); } );
        var waveGroup = gaugeGroup.append("defs")
            .append("clipPath")
            .attr("id", "clipWave" + elementId);
        var wave = waveGroup.append("path")
            .datum(data)
            .attr("d", clipArea)
            .attr("T", 0);

        // The inner circle with the clipping wave attached.
        var fillCircleGroup = gaugeGroup.append("g")
            .attr("clip-path", "url(#clipWave" + elementId + ")");
        fillCircleGroup.append("circle")
            .attr("cx", radius)
            .attr("cy", radius)
            .attr("r", fillCircleRadius)
            .style("fill", config.waveColor);

        // Text where the wave does overlap.
        var text2 = fillCircleGroup.append("text")
            .text(textRounder(textStartValue) + percentText)
            .attr("class", "liquidFillGaugeText")
            .attr("text-anchor", "middle")
            .attr("font-size", textPixels + "px")
            .style("fill", config.waveTextColor)
            .attr('transform','translate('+radius+','+textRiseScaleY(config.textVertPosition)+')');

        // Make the value count up.
        if(config.valueCountUp){
            var textTween = function(){
                var i = d3.interpolate(this.textContent, textFinalValue);
                return function(t) { this.textContent = textRounder(i(t)) + percentText; }
            };
            text1.transition()
                .duration(config.waveRiseTime)
                .tween("text", textTween);
            text2.transition()
                .duration(config.waveRiseTime)
                .tween("text", textTween);
        }

        // Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement can be controlled independently.
        var waveGroupXPosition = fillCircleMargin+fillCircleRadius*2-waveClipWidth;
        if(config.waveRise){
            waveGroup.attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(0)+')')
                .transition()
                .duration(config.waveRiseTime)
                .attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(fillPercent)+')')
                .each("start", function(){ wave.attr('transform','translate(1,0)'); }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
        } else {
            waveGroup.attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(fillPercent)+')');
        }

        if(config.waveAnimate) animateWave();

        function animateWave() {
            console.log('wave', wave);
            if(wave[0][0] !== 'undefined' && wave[0][0] !== null){
            wave.attr('transform','translate('+waveAnimateScale(wave.attr('T'))+',0)');
            wave.transition()
                .duration(config.waveAnimateTime * (1-wave.attr('T')))
                .ease('linear')
                .attr('transform','translate('+waveAnimateScale(1)+',0)')
                .attr('T', 1)
                .each('end', function(){
                    wave.attr('T', 0);
                    animateWave(config.waveAnimateTime);
                });
            }
        }

        function GaugeUpdater(){
            this.update = function(value){
                var newFinalValue = parseFloat(value).toFixed(2);
                var textRounderUpdater = function(value){ return Math.round(value); };
                if(parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))){
                    textRounderUpdater = function(value){ return parseFloat(value).toFixed(1); };
                }
                if(parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))){
                    textRounderUpdater = function(value){ return parseFloat(value).toFixed(2); };
                }

                var textTween = function(){
                    var i = d3.interpolate(this.textContent, parseFloat(value).toFixed(2));
                    return function(t) { this.textContent = textRounderUpdater(i(t)) + percentText; }
                };

                text1.transition()
                    .duration(config.waveRiseTime)
                    .tween("text", textTween);
                text2.transition()
                    .duration(config.waveRiseTime)
                    .tween("text", textTween);

                var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value))/config.maxValue;
                var waveHeight = fillCircleRadius*waveHeightScale(fillPercent*100);
                var waveRiseScale = d3.scale.linear()
                    // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
                    // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
                    // circle at 100%.
                    .range([(fillCircleMargin+fillCircleRadius*2+waveHeight),(fillCircleMargin-waveHeight)])
                    .domain([0,1]);
                var newHeight = waveRiseScale(fillPercent);
                var waveScaleX = d3.scale.linear().range([0,waveClipWidth]).domain([0,1]);
                var waveScaleY = d3.scale.linear().range([0,waveHeight]).domain([0,1]);
                var newClipArea;
                if(config.waveHeightScaling){
                    newClipArea = d3.svg.area()
                        .x(function(d) { return waveScaleX(d.x); } )
                        .y0(function(d) { return waveScaleY(Math.sin(Math.PI*2*config.waveOffset*-1 + Math.PI*2*(1-config.waveCount) + d.y*2*Math.PI));} )
                        .y1(function(d) { return (fillCircleRadius*2 + waveHeight); } );
                } else {
                    newClipArea = clipArea;
                }

                var newWavePosition = config.waveAnimate?waveAnimateScale(1):0;
                wave.transition()
                    .duration(0)
                    .transition()
                    .duration(config.waveAnimate?(config.waveAnimateTime * (1-wave.attr('T'))):(config.waveRiseTime))
                    .ease('linear')
                    .attr('d', newClipArea)
                    .attr('transform','translate('+newWavePosition+',0)')
                    .attr('T','1')
                    .each("end", function(){
                        if(config.waveAnimate){
                            wave.attr('transform','translate('+waveAnimateScale(0)+',0)');
                            animateWave(config.waveAnimateTime);
                        }
                    });
                waveGroup.transition()
                    .duration(config.waveRiseTime)
                    .attr('transform','translate('+waveGroupXPosition+','+newHeight+')')
            }
        }

        return new GaugeUpdater();
    }

    runGauge();
    }
})();
