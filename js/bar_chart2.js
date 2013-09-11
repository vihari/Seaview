/*
  For time being part of code was cpoied from http://jsfiddle.net/KSAbK/1/ by Strudel
  http://stackoverflow.com/questions/15705527/chart-zooming-in-d3
 */
var big = getUrlVars()["big"];
var dataset = []
var data = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
	     11, 12, 15, 20, 18, 17, 16, 18, 23, 25,43,34,65,24,24,13 ];
dataset = []
var load = localStorage.getItem("data");

//The bar that is being displayed and display of all bars respectively
var bar,all_bars;

var num = 0;
var highlight_width = 20;
parseLocalStorage = function(load,dataset){
    num = 0;
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

//Put the row Num in local storage for it to be highlighted in the log.
var highlightLog = function(d){
    //This is rowNum of corresponding log in the log file.
    //TODO: sometime this may be invalid when plot and log are not connected, handle that.
    //TODO: also should convey about ip_num
    localStorage.setItem("bar_id",d.id);
}

window.onload = function() {
    if (window.addEventListener) {
	window.addEventListener("storage",handle_storage,false);
    } else {
	window.attachEvent("onstorage", handle_storage);
    }
};

function barChart(col){
    var sp = window.innerWidth-40 ;
    var width = window.innerWidth;
    margin = {
	top: 20,
	right: 20,
	bottom: 20,
	left: 45
    };
    
    var w = Math.floor(sp/dataset.length),h = 150;
    w = Math.floor(sp/((d3.max(xindices)-d3.min(xindices))));
    var height = h;
    //x-offset
    var offset = 1.5;
    var leftOffset = 30;

    window.x = d3.scale.linear()
	.domain(d3.extent(xindices))
	.range([leftOffset,sp]);

    window.y = d3.scale.linear()
	.domain(d3.extent(dataset))
	.rangeRound([h,0])
	.nice();

    var line = d3.svg.line()
	.x(function (d) {
	    return x(d.x);
	})
	.y(function (d) {
	    return y(d.value);
	});

    //restricted to only x scaling
    var zoom = d3.behavior.zoom()
	.x(x)
	.on("zoom", zoomed);

    svg = d3.select('div#barchart')
	.append("svg:svg")
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.append("svg:g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	.call(zoom);

    svg.append("svg:rect")
	.attr("width", width)
	.attr("height", height)
	.attr("class", "plot");

    var make_x_axis = function () {
	return d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(5);
    };

    var make_y_axis = function () {
	return d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(5);
    };

    var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom")
	.ticks(5);

    svg.append("svg:g")
	.attr("class", "x axis")
	.attr("transform", "translate(0, " + height + ")")
	.call(xAxis);

    var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left")
	.ticks(5);

    svg.append("g")
	.attr("class", "y axis")
	.call(yAxis);

    svg.append("g")
	.attr("class", "x grid")
	.attr("transform", "translate(0," + height + ")")
	.call(make_x_axis()
	      .tickSize(-height, 0, 0)
	      .tickFormat(""));

    svg.append("g")
	.attr("class", "y grid")
	.call(make_y_axis()
	      .tickSize(-width, 0, 0)
	      .tickFormat(""));

    var clip = svg.append("svg:clipPath")
	.attr("id", "clip")
	.append("svg:rect")
	.attr("x", 0)
	.attr("y", 0)
        .attr("fill","white")
	.attr("width", width)
	.attr("height", height);

    var l = d3.svg.line()
	.x(function(d, i) { 
	    return x(d.x); })
	.y(function(d, i) { return y(0); }); 
    
    var zeroArray = Array.apply(null, new Array(dataset.length)).map(Number.prototype.valueOf,0);
    svg.append("path")
	.datum(data)
	.attr("class", "darkline")
	.attr("d", l);
    
    window.chartBody = svg.append("g")
	.attr("clip-path", "url(#clip)");
    
    chartBody.append("svg:path")
	.datum(data)
	.attr("class", "line")
	.attr("d", line);

    var updateBarChart = function(){
	w = width/(x.domain()[1]-x.domain()[0]);
	if(w<0)
	    return;
	zeroPosition = y(0);
	svg.selectAll("rect.plot")
	    .data(data)	
	    .enter().append("svg:rect")
	    .attr("x", function(d){return x(d.x) - offset-w/2;})
	    .attr("y", function(d) { return d.value>=0?(y(d.value)):zeroPosition; })
	    .attr("class", function(d) { return d.value < 0 ? "bar negative" : "bar positive"; })
            .attr("width", w)
	    .attr("height", function(d){return Math.abs(y(d.value)-y(0));})
	    .on("click",function(d){highlightLog(d);})
	    .on("mouseover", function(d){d.value<0?d3.select(this).style("fill","blue"):d3.select(this).style("fill","red");})
	    .on("mouseout", function(d){d.value<=0?d3.select(this).style("fill","brown"):d3.select(this).style("fill","steelblue");});
    }
    
    var removeBars = function(){
	d3.selectAll("rect.bar.negative").data([]).exit().remove();
	d3.selectAll("rect.bar.positive").data([]).exit().remove();
    }

    function zoomed() {
	svg.select(".x.axis").call(xAxis);
	//svg.select(".y.axis").call(yAxis);
	svg.select(".x.grid")
            .call(make_x_axis()
		  .tickSize(-height, 0, 0)
		  .tickFormat(""));
	/*svg.select(".y.grid")
            .call(make_y_axis()
		  .tickSize(-width, 0, 0)
		  .tickFormat(""));
	*/
	svg.select(".line")
            .attr("class", "line")
            .attr("d", line);
	removeBars();
	updateBarChart();
    }

    window.handle_storage = function(e){
	console.log(e);
	if(e.bar_id_plot != 'undefined'){
	    var index = ids.indexOf(parseInt(e.bar_id_plot,10));
	    if(index<0)
		return;
	    var x_d = xindices[index];
	    var y_d = dataset[index];
	    var zeroPosition = y(0);
	    var h = Math.abs(y(y_d)-y(0));
	    console.log(x_d,y_d,h);
	    y_d = y_d>=0?(y(y_d)):zeroPosition;
	    
	    if(h>15){
		var tempBar=svg.append("svg:rect")
		    .attr("x",x(x_d)-highlight_width/2)
		    .attr("y",y_d)
		    .attr("width",highlight_width)
		    .attr("height",h)
		    .attr("opacity",1)
		    .attr("class","tempBar")
		    .attr("fill","yellow");
		
		tempBar
		    .transition()
		    .attr("width",0)
		    .attr("opacity",0.5)
		    .duration(1000);
	    }
	    else{
		var tempBar=svg.append("svg:rect")
		    .attr("x",x(x_d)-highlight_width/2)
		    .attr("y",y_d)
		    .attr("width",highlight_width)
		    .attr("height",30)
		    .attr("opacity",1)
		    .attr("class","tempBar")
		    .attr("fill","yellow");
		
		tempBar
		    .transition()
		    .attr("width",0)
		    .attr("opacity",0.5)
		    .attr("height",0)
		    .duration(1000);
	    }
	    setTimeout(function(){
	    d3.select("rect.tempBar").data([]).exit().remove();
	    },1100);
	}
    }
}
