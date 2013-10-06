var Selector = gup("selector");
var SelectorID = parseInt(gup("selectorID"));
var index = 0;
data_raw = [];
ip_nums = [];
indices = {};

var margin = {top: 20, right: 50, bottom: 30, left: 50},
    width = parseInt(gup("width")) - margin.left - margin.right,
    height = parseInt(gup("height")) - margin.top - margin.bottom;

function gup(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
        return "";
    else
        return results[1];
} 

function makeArrayOf(value, length) {
    if(typeof(value) !== "object"){
	var arr = [], i = length;
	while (i--) {
	    arr[i] = value;
	}
	return arr;
    }
    //TODO: It should be a new instance of the object type not a specific type
    else{
	var arr = [], i = length;
	while (i--) {
	    arr[i] = {};
	}
	return arr;
    }
}

//Max and min for hashes
var extentHash = function(hash){
    var min = Math.pow(10,9);var max = -min;
    d3.keys(hash).map(function(key){
	max = hash[key]>max?hash[key]:max;
	min = hash[key]<min?hash[key]:min;
    });
    return([min,max]);
};

var extent = function(arr,field){
    var min = Math.pow(10,9);var max = -min;
    arr.map(function(d){
	if(typeof(d[field])!=="string"){
	    max = d[field]>max?d[field]:max;
	    min = d[field]<min?d[field]:min;
	}
	else{
	    if(!mix_up){
		max = d[field].length>max?d[field].length:max;
		min = d[field].length<min?d[field].length:min;
	    }
	}
    });
    return ([min,max]);
}

var mixUp = function(arr,field){
    number = false;
    string = true;
    arr.map(function(d){
	if(typeof(d["value"]) === "string")
	    string = true;
	else if(typeof(d["value"]) == "number")
	    number = true;
	if(string&&number)
	    return true;
    })
    return false;
}

ips.map(function(d,i){
    if(d[Selector] == SelectorID){
	var ip = d["IPNum"]
	ip_nums.push(ip);
    }
});

run_logs.map(function(d,i){
    ip_nums.map(function(ip,i){
	if(ip == d["ip_num"])
	    data_raw.push({
		"label":ip,
		"log": d["log"],
		"time": d["time"],
		"lineNum": d["lineNum"],
		"value":d["value"],
		"index":++index
	    });
    });
});

//data = makeArrayOf({},extentHash(indices)[1]+1);
data = [];

mix_up = false;
if(mixUp(data_raw,"value")){
    console.error("String and number cannot be in the same dimension, something's not right!");
    mix_up = true;
}

//The field to be plotted on X
var field_x = gup("x");
data_raw.map(function(d){
    valueSig = ips[d.label].valueSig;
    numerical = ["I","J","F","D","S"];
    is_numeric = false;
    numerical.map(function(b){
	if(valueSig == b)
	    is_numeric = true;
    });

    
    if(is_numeric)
	data.push({"value":d["value"],
		   "index":d[field_x],
		   "name": d["label"]
		  });
    
    else if((valueSig == "C")||(valueSig.search(/L.*/)>-1)){
	if(!mix_up)
	    data.push({"value":d["value"].length,
		       "index":d[field_x],
		       "name": d["label"]
		      });
    }
    else if(valueSig == "Z"){
	v = d["value"]==="true"?1:0;
	data.push({"value":v,
		   "index":d[field_x],
		   "name": d["label"]
		  });
    }
});

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

x.domain(extent(data_raw,field_x));
var y_domain = extent(data,"value");
if(y_domain[0] == y_domain[1])
    y.domain([y_domain[0]-1,y_domain[0]+1]);
else
    y.domain(y_domain);

var color = d3.scale.category20();
names = [];
data.map(function(d){
    names.push(d.name);
});
color.domain(names);

var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(3)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(5)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return x(d.index); })
    .y(function(d) { return y(d.value); });

var zoom = d3.behavior.zoom()
    .x(x)
    .on("zoom",zoomed);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(zoom);

//This is to be able to zoom any where on the graph
svg.append("svg:rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill","white")
    .attr("class", "zoom-plot");

svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

svg.append("path")
    .datum(data)
    .attr("class", "strokes")
    .attr("d", line)
    .style("stroke","teal");

radius = height/50;
svg.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("cy", function(d){return y(d.value);})
    .attr("cx", function(d){return x(d.index);})
    .attr("r",function(){var diff = y.range()[0]-y.range()[1];
			 //return(y(Math.abs(diff/40)));
			 return radius;
			})
    .attr("fill",function(d){return color(d.name)})
    .style("stroke","black");

function zoomed() {
    svg.select(".x.axis").call(xAxis);

    svg.select(".x.grid")
        .call(d3.svg.axis()
	      .scale(x)
	      .ticks(3)
	      .orient("bottom")
	      .tickSize(-height, 0, 0)
	      .tickFormat(""));
        
    svg.select(".strokes")
        .attr("class", "strokes")
        .attr("d", line);

    svg.selectAll('circle')
	.attr("cx", function(d) {return x (d.index); })
	.attr("cy", function(d) {return y (d.value); })
	.attr("r", function(d) {var diff = y.range()[0]-y.range()[1];
				//return(y(Math.abs(diff/40)));
				return radius;
			       });
}

triggerClick = function(){
    console.log("called");
    d = SelectorID;
    localStorage.setItem("trigger",d);
}
$("svg").bind('click',triggerClick);
