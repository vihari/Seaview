var dimID = 244;
data_raw = [];
ip_nums = [];
indices = {};

var margin = {top: 20, right: 50, bottom: 30, left: 50},
    width = 200 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

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
	max = d[field]>max?d[field]:max;
	min = d[field]<min?d[field]:min;
    });
    return ([min,max]);
}

ips.map(function(d,i){
    if(d["dimensionID"] == dimID){
	var ip = d["IPNum"]
	ip_nums.push(ip);
	indices[ip+""] = 0;
    }
});

logs.map(function(d,i){
    ip_nums.map(function(ip,i){
	if(ip == d["right"])
	    data_raw.push({
		"label":ip,
		"value":d["left"],
		"index":++indices[ip+""]
	    });
    });
});

data = makeArrayOf({},extentHash(indices)[1]+1);
data_raw.map(function(d){
    data[d["index"]-1]["index"] = d["index"];
    data[d["index"]-1][d["label"]+""] = d["value"];
});

if(ip_nums.length>20)
    console.error("The number of dims is greater than the color limit");
var dimensionID = ips[ip_nums[0]].dimensionID;
is_quant_or_ord = reps[dimensionID];
console.log(is_quant_or_ord)
if(is_quant_or_ord)
    insertScatterPlot();
else{
    vals = [];
    data.map(fucntion(d){
	vals.push(d.value);
    });
    insertHistogram(vals);
}

insertScatterPlot = function(){
    var x = d3.scale.linear()
	.range([0, width]);

    var y = d3.scale.linear()
	.range([height, 0]);

    x.domain(extentHash(indices));
    y.domain(extent(data_raw,"value"));

    var color = d3.scale.category20();

    var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");

    var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left");

    var line = d3.svg.line()
	.interpolate("basis")
	.x(function(d,i) { return x(i); })
	.y(function(d) { return y(d); });

    var svg = d3.select("body").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "index"; }));
    svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis);

    svg.append("g")
	.attr("class", "y axis")
	.call(yAxis);

    //column view of data
    var cols = [];
    color.domain().map(function(ip){
	values = [];
	name = "";
	
	data.map(function(d) {
	    if(typeof(d[ip])!== "undefined")
		values.push(d[ip]);
	    else
		values.push(0);
	    name = ip;
	});
	cols.push({
	    "name": name,
	    "values": values
	})
    });

    var ip = svg.selectAll(".strokes")
	.data(cols)
	.enter().append("g")
	.attr("class", "strokes");

    ip.append("path")
	.attr("class", "strokes")
	.attr("d", function(d) { return line(d.values); })
	.attr("data-legend",function(d) { return d.name})
	.style("stroke", function(d) { return color(d.name); });

    ip.append("text")
	.datum(function(d) { console.log(d); return {name: d.name, value: d.values[d.values.length - 1], x:extentHash(indices)[1]}; })
	.attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.value) + ")"; })
	.attr("x", 3)
	.attr("dy", ".35em")
	.style("stroke",function(d){ return color(d.name); })
	.text(function(d) { return d.name; });

    legend = svg.append("g")
	.attr("class","legend")
	.attr("transform","translate(840,30)")
	.style("font-size","12px")
	.call(d3.legend);
}

insertHistogram = function(values){
    // A formatter for counts.
    var formatCount = d3.format(",.0f");

    var x = d3.scale.linear()
	.domain(d3.extent(values))
	.range([0, width]);

    // Generate a histogram using twenty uniformly-spaced bins.
    var data = d3.layout.histogram()
	.bins(x.ticks(20))
    (values);

    var y = d3.scale.linear()
	.domain([0, d3.max(data, function(d) { return d.y; })])
	.range([height, 0]);

    var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");

    var svg = d3.select("body").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.style("position","fixed")
	.style("left",max_width+80+"px")
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bar = svg.selectAll(".bar")
	.data(data)
	.enter().append("g")
	.attr("class", "bar")
	.attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

    var bar_width = data[0].dx;

    bar.append("rect")
	.attr("x", 1)
	.attr("width", x(bar_width)-x(0) - 1)
	.attr("height", function(d) { return height - y(d.y); });

    bar.append("text")
	.attr("dy", ".75em")
	.attr("y", 6)
	.attr("x", (x(bar_width)-x(0))/2)
	.attr("text-anchor", "middle")
	.text(function(d) { return formatCount(d.y); });

    svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis);

    console.log(data);
}
