var big = getUrlVars()["big"];
var dataset = []
var data = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
	     11, 12, 15, 20, 18, 17, 16, 18, 23, 25,43,34,65,24,24,13 ];
dataset = []
var load = localStorage.getItem("data");

var num = 0;
for(var i=0;i<load.length;i++){
    if(load[i]!=',')
	num = num*10+parseInt(load[i]);
    else if(load[i]==','){
	dataset.push(num)
	num=0;	
    }
}
//dataset = data
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function barChart(col){
    var sp = Math.floor((1100/1160)*window.innerWidth) ;
    var w = Math.floor(sp/dataset.length),h = 150;
    var x = d3.scale.linear()
	.domain([0, 1])
	.range([0, w]);
    
    var y = d3.scale.linear()
	.domain([0, d3.max(dataset)])
	.rangeRound([0, h]);

    chart = d3.select("div#barchart")
	.append("svg")
	.attr("width","100%")
    	.attr("class","bar")
	.append("g")
	.attr("transform", "translate(20,0)");

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
	.style("stroke", "#ccc");
    
    chart.selectAll("rect")
	.data(dataset)
	.enter().append("rect")
        .attr("x", function(d,i){return x(i) - .5;})
	.attr("y", function(d) { return h - y(d) - .5; })
        .attr("width", w)
	.attr("height", function(d){return y(d);})
	.attr("fill",'steelblue');

    //To position text with the lines
    var m = y.ticks(10)
    chart.selectAll(".rule")
	.data(y.ticks(5))
	.enter().append("text")
	.attr("class", "rule")
	.attr("x", 0)
	.attr("y", function(d) { return h - y(d) - .5; })
	.attr("dx", 6)
	.attr("text-anchor", "middle")
	.attr("fill","white")
	.attr("font-size","14px")
	.text(String);
}

