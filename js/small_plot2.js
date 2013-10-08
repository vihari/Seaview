$(document).ready(function(){
    var Selector = gup("selector");
    var SelectorID = parseInt(gup("selectorID"));
    var index = 0;
    data_raw = [];
    ip_nums = [];
    indices = {};

    var margin = {top: 30, right: 50, bottom: 50, left: 50},
    width = parseInt(gup("width")) - margin.left - margin.right,
    height = parseInt(gup("height")) - margin.top - margin.bottom;
    available_width = screen.width;

    font_size = "";
    if(height>400)
	font_size="16px";
    else
	font_size="10px";
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
		    "index":++index,
		    "className": ips[ip].className
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
    var type = "";
    data_raw.map(function(d){
	valueSig = ips[d.label].valueSig;
	numerical = ["I","J","F","D","S"];
	is_numeric = false;
	numerical.map(function(b){
	    if(valueSig == b)
		is_numeric = true;
	});

	
	if(is_numeric){
	    if((valueSig == "I")||(valueSig == "J")||(valueSig == "S"))
		type = "int";
	    else type = "float";
	    //lineNum is required to highlight the corresponding log in log viewer
	    data.push({"value":d["value"],
		       "index":d[field_x],
		       "name": d["label"],
		       "lineNum":d["lineNum"],
		       "log": d["log"],
		       "className": d["className"]
		      });
	}
	else if((valueSig == "C")||(valueSig.search(/L.*/)>-1)){
	    type = "string";
	    if(!mix_up)
		data.push({"value":d["value"].length,
			   "index":d[field_x],
			   "name": d["label"],
			   "lineNum":d["lineNum"],
			   "log": d["log"],
			   "className": d["className"]
			  });
	}
	else if(valueSig == "Z"){
	    type = "bool";
	    v = d["value"]==="true"?1:0;
	    data.push({"value":v,
		       "index":d[field_x],
		       "name": d["label"],
		       "lineNum":d["lineNum"],
		       "log": d["log"],
		       "className": d["className"]
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

    var indicators = {
	"float": "#FFF0F0",
	"int":"#F6E7FF",
	"string": "#DFECFF",
	"bool": "#DFFFF5"
    };
    var color = d3.scale.category20();
    names = [];
    data.map(function(d){
	names.push(d.name);
    });
    color.domain(names);

    console.log(ip_nums[0]);
    var dimensionID = ips[ip_nums[0]].dimensionID;
    is_quant_or_ord = reps[dimensionID].is_quant_or_ord;
    var_name = reps[dimensionID].name;
    if(var_name.search(/\sin\s/)>-1)
	split_name = var_name.split(/\sin\s/)[0];
    else if(var_name.search(/\sof\s.*?,\s?type.*/))
	split_name = var_name.split(/\sof\s/)[0];
    console.log(split_name);console.log(var_name);

    insertHistogram = function(values){
	// A formatter for counts.
	var formatCount = d3.format(",.0f");

	var x = d3.scale.linear()
	    .domain(d3.extent(values))
	    .range([0, width]);

	// Generate a histogram using twenty uniformly-spaced bins.
	var data = d3.layout.histogram()
	    .bins(x.ticks(10))
	(values);

	var y = d3.scale.linear()
	    .domain([0, d3.max(data, function(d) { return d.y; })])
	    .range([height, 0]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .ticks(3)
	    .orient("bottom");

	var svg = d3.select("body").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append("svg:rect")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("fill",indicators[type])
	    .attr("class", "zoom-plot");

	svg.append("text")
            .attr("x", (width / 2))             
            .attr("y", 0 -(margin.top/3))
            .attr("text-anchor", "middle")  
            .style("font-size", font_size) 
            .text(split_name);

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
	    .style("font-size",font_size)
	    .text(function(d) { 
		dom = y.domain();
		if(d.y>(dom[0]+(Math.abs(dom[1]-dom[0])/10)))
		    return formatCount(d.y); 
	    })
	    .style("text-anchor", "end")
	    //.attr("dx", "-3.8em")
	    .attr("dy", ".15em")
	    .attr("transform", function(d) {
		return "rotate(-90)" 
	    });

	svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis)
	.selectAll("text")
	    .style("font-size",font_size)
	    .style("text-anchor", "end")
	    .attr("dx", "-.8em")
	    .attr("dy", ".15em")
	    .attr("transform", function(d) {
		return "rotate(-30)" 
	    });

	console.log(data);
    }

    insertScatterPlot = function(){
	xAxis = d3.svg.axis()
	    .scale(x)
	    .ticks(3)
	    .orient("bottom");

	yAxis = d3.svg.axis()
	    .scale(y)
	    .ticks(5)
	    .orient("left");

	var line = d3.svg.line()
	    .x(function(d) { return x(d.index); })
	    .y(function(d) { return y(d.value); });

	var zoom = d3.behavior.zoom()
	    .x(x)
	    .on("zoom",zoomed);

	svg = d3.select("body").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	    .call(zoom);

	//This is to be able to zoom any where on the graph
	svg.append("svg:rect")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("fill",indicators[type])
	    .attr("class", "zoom-plot");

	svg.append("text")
            .attr("x", (width / 2))             
            .attr("y", 0 -(margin.top/3))
            .attr("text-anchor", "middle")  
            .style("font-size", font_size) 
            .text(split_name);


	svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis)
	    .selectAll("text")  
	    .style("text-anchor", "end")
	    .attr("dx", "-.8em")
	    .attr("dy", ".15em")
	    .style("font-size", font_size)
	    .attr("transform", function(d) {
		return "rotate(-30)" 
	    });

	svg.append("g")
	    .attr("class", "y axis")
	    .call(yAxis)
	    .selectAll("text")  
	    .style("font-size",font_size);

	/*svg.append("path")
	  .datum(data)
	  .attr("class", "strokes")
	  .attr("d", line)
	  .style("stroke","teal");
	*/

	radius = height/30;
	svg.selectAll("circle")
	    .data(data)
	    .enter().append("circle")
	    .attr("cy", function(d){return y(d.value);})
	    .attr("cx", function(d){return x(d.index);})
	    .attr("r",function(){var diff = y.range()[0]-y.range()[1];
				 //return(y(Math.abs(diff/40)));
				 return radius;
				})
	    .on("mouseover", function(d){d3.select(this).style("fill","red")})
	    .on("mouseout", function(d){d3.select(this).style("fill",color(d.name))})
	    .on("click",function(d){console.log(d);highlightLog(d)})
	    .attr("fill",function(d){return color(d.name)})
	    .attr("opacity","0.5")
	    .style("stroke",function(d){return color(d.name)});
    }

    vals = [];
    data.map(function(d){
	vals.push(d.value);
    });
    uniqueVals = vals.filter(function(elem, pos) {
	return vals.indexOf(elem) == pos;
    });
    
    if((is_quant_or_ord)||(uniqueVals.length<=1))
	insertScatterPlot();
    else
	insertHistogram(vals);

    //Put the row Num in local storage for it to be highlighted in the log.
    var highlightLog = function(d){
	//This is rowNum of corresponding log in the log file.
	//TODO: sometime this may be invalid when plot and log are not connected, handle that.
	//TODO: also should convey about ip_num
	localStorage.setItem("file",d.className);
	localStorage.setItem("log_string",d.log);
	localStorage.setItem("bar_id",d.lineNum-1);
    }

    function zoomed() {
	svg.select(".x.axis").call(xAxis)
	    .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
	    .style("font-size",font_size)
            .attr("transform", function(d) {
		return "rotate(-30)" 
            });

	svg.select(".x.grid")
            .call(d3.svg.axis()
		  .scale(x)
		  .ticks(3)
		  .orient("bottom")
		  .tickSize(-height, 0, 0)
		  .tickFormat(""));
	
	/*svg.select(".strokes")
	  .attr("class", "strokes")
	  .attr("d", line);*/

	svg.selectAll('circle')
	    .attr("cx", function(d) {
		if((d.index>=x.domain()[0])&&(d.index<=x.domain()[1]))
		    return x(d.index);
		else return -100;
	    })
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
});
