var big = getUrlVars()["big"];
var dataset = []
var data = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
	     11, 12, 15, 20, 18, 17, 16, 18, 23, 25,43,34,65,24,24,13 ];
dataset = []
var load = localStorage.getItem("data");

//The bar that is being displayed and display of all bars respectively
var bar,all_bars;

var num = 0;
//Number of bars that are shown when zoomed
var numZoomed = 1000;
parseLocalStorage = function(load,dataset){
    negativeNum = false;
    for(var i=0;i<load.length;i++){
	if(load[i]!=','&&load[i]!='-'){
	    if(!negativeNum)
		num = num*10+parseInt(load[i]);
	    else
		num = num*10-parseInt(load[i]);
	}
	else if(load[i] == '-')
	    negativeNum = true;
	else if(load[i]==','){
	    negativeNum = false;
	    dataset.push(num)
	    num=0;	
	}
    }
}

parseLocalStorage(load,dataset);

//X-axis: line num
load = localStorage.getItem("X-index");
var xindices = [];
parseLocalStorage(load,xindices);

//This is for sync between Seaview and bar chart
load = localStorage.getItem("ids");
var ids = [];
parseLocalStorage(load,ids);

//Make an object
data = [];
for(var i=0;i<dataset.length;i++)
    data.push({
	"value": dataset[i],
	"id":ids[i],
	"x":xindices[i]
    });

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function barChart(col){
    var sp = window.innerWidth-40 ;
    sp = 50000;
    var w = Math.floor(sp/dataset.length),h = 150;
    w = Math.floor(sp/((d3.max(xindices)-d3.min(xindices))));
    //x-offset
    var offset = 1.5;
    var leftOffset = 30;

    window.x = d3.scale.linear()
	.domain(d3.extent(xindices))
	.range([leftOffset,sp]);

    y0 = Math.max(-d3.min(dataset), d3.max(dataset));
    window.y = d3.scale.linear()
	.domain(d3.extent(dataset))
	.rangeRound([0, h])
	.nice();


    chart = d3.select("div#barchart")
	.append("svg")
	.attr("width","4000")
    	.attr("class","bar")
      .append("g")
        .call(d3.behavior.zoom().on("zoom", redraw))
	.append('g')
	.attr("transform", "translate(20,0)");

    chart.append('svg:rect')
	.attr('width', sp)
	.attr('height', h)
	.attr('fill', 'black');

    function redraw() {
	/*chart.attr("transform",
		 //"translate(" + d3.event.translate + ")"
		 "scale(" + d3.event.scale + ")");
	*/
	d3.event.transform(x);
    }
    
    chart.append("line")
	.attr("x1", 0)
        .attr("x2", sp)
        .attr("y1", h - .5)
        .attr("y2", h - .5)
        .style("stroke", "#FFF");

    //This is to add ticks to the barchart
    chart.selectAll("line")
	.data(y.ticks(5))
	.enter().append("line")
	.attr("x1", 0)
	.attr("x2", sp)
	.attr("y1", function(d) { return h - y(d) - .5; })
	.attr("y2", function(d) { return h - y(d) - .5; })
	.style("stroke", "#302E2E");
    
    var zeroPosition = h-y(0);
    chart.selectAll("rect")
	.data(data)
	.enter().append("rect")
          .attr("x", function(d){return x(d.x) - offset;})
	  .attr("y", function(d) { return d.value>=0?(zeroPosition-(y(d.value)-y(0))):zeroPosition; })
	  .attr("class", function(d) { return d.value < 0 ? "bar negative" : "bar positive"; })
          .attr("width", w)
	  .attr("height", function(d){return Math.abs(y(d.value)-y(0));})
	.on("click",function(d,i){return d==bar?zoom(-1,-1):zoom(d,i)})
	.on("mouseover", function(d){d.value<0?d3.select(this).style("fill","blue"):d3.select(this).style("fill","red");})
        .on("mouseout", function(d){d.value<=0?d3.select(this).style("fill","brown"):d3.select(this).style("fill","steelblue");});

    //To position text with the lines
    var m = y.ticks(10)
    chart.selectAll(".rule")
	.data(y.ticks(5))
	.enter().append("text")
	.attr("class", "rule")
	.attr("x", 0)
	.attr("y", function(d) { return h - y(d) + 13; })
	.attr("dx", 6)
	.attr("text-anchor", "middle")
	.attr("fill","white")
	.attr("font-size","14px")
	.text(String);
    
    d3.select(window).on("click", function() { zoom(-1,-1); });

    window.zoom = function(d, i) {
	var lowerlt = d3.min(xindices);
	var upperlt = d3.max(xindices);
	if(i>-1){
	    var lo = d.x-numZoomed/2;
	    var up = d.x+numZoomed/2;
	    if(lo>lowerlt&&up<upperlt)
		x.domain([lo, up]);
	    else if(lowerlt>lo&&up<upperlt)
		x.domain([d3.min(xindices),up]);
	    else if(upperlt<up&&lowerlt<lo)
		x.domain([lo,d3.max(xindices)]);
	    else 
		console.error("Set numZoomed to a lower value.");
	    x.range([leftOffset,sp]);	    
	    var t = chart.transition()
		.duration(750);
	    
	    t.selectAll("rect")
		.attr("x", function(d) { return x(d.x) - offset})
		.attr("y", function(d) { return d.value>=0?(zeroPosition-(y(d.value)-y(0))):zeroPosition; })
		//.attr("y", function(d,i) { return h- y(d) -.5; })
		.attr("width", function() { return (sp/numZoomed); });
	    
	    bar = d;
	    d3.event.stopPropagation();
	}

	//revert to normal view
	else{
	    temp = numZoomed;
	    numZoomed = d3.max(xindices)-d3.min(xindices);
	    x.domain(d3.extent(xindices));
	    x.range([leftOffset,sp]);
	    
	    var t = chart.transition()
		.duration(750);
	    
	    t.selectAll("rect")
		.attr("x", function(d) { return x(d.x) - offset })
		.attr("y", function(d) { return d.value>=0?(zeroPosition-(y(d.value)-y(0))):zeroPosition; })
	        //.attr("y", function(d,i) { return h- y(d) -.5; })
		.attr("width", function() { return (w); });
	    
	    bar = d;
	    d3.event.stopPropagation();

	    numZoomed = temp;
	}
    }
}
