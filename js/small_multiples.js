$(document).ready(function(){
    var GroupByDim = true;

    /*get all the dim ID's and ip_nums logged
      and then should be sorted according to their 
      1. frequency,
      2. difference between max and min values of the variable
      3. sudden change in consecutive values logged of the variable.
      each one can have its own weight.
      hence every ip/dimension is logged with count, max,min and max difference.
    */

    var margin = {top: 50, right: 50, bottom: 30, left: 20};
    var width = 200,height = 200;
    var available_width = screen.width;
    var max_width = 0.6*screen.width;
    var info_width = available_width-max_width-2*(margin.left+margin.right);
    //var Selector = gup("selector");
    var sel = document.getElementById("selector_select");
    var Selector = sel.options[sel.selectedIndex].value;

    $("#div1").width(max_width);
    $("#div2").width(info_width);
    $("#div2").height(500);
    document.getElementsByClassName("verticalLine")[0].style.position = "fixed";
    document.getElementsByClassName("verticalLine")[0].style.left = max_width+50+"px";
    document.getElementsByClassName("verticalLine")[0].style.top = "0px";
    $('.verticalLine').height(screen.height);
    document.getElementById("div2").style.position = "fixed";
    document.getElementById("div2").style.left = max_width+70+"px";

    var indicators = {
	"float": "#FFF0F0",
	"int":"#F6E7FF",
	"string": "#DFECFF",
	"bool": "#DFFFF5"
    };
    html = "";
    d3.keys(indicators).map(function(key){
	html += "<div style='width:100px;height:20px;float:left;background-color:"+indicators[key]+"'> &nbsp&nbsp"+key+"</div>";
    });
    $("#palletes").html(html);

    triggerSelectorChange = function(evt){
	Selector = sel.options[sel.selectedIndex].value;

	$("iframe").remove();
	render();
    };
    $("#selector_select").change(triggerSelectorChange);

    var extent = function(arr,field){
	var min = Math.pow(10,9);var max = -min;
	arr.map(function(d){
	    max = d[field]>max?d[field]:max;
	    min = d[field]<min?d[field]:min;
	});
	return ([min,max]);
    }

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

    render = function(){
	vars = {};
	run_logs.map(function(d){
	    var ip = d.ip_num;
	    var SelectorID = ips[ip][Selector];
	    
	    if(typeof(vars[SelectorID])==="undefined"){
		vars[SelectorID] = {
		    max : d.value,
		    min : d.value,
		    max_diff : -1,
		    count : 1,
		    last_value: d.value
		};
	    }
	    else{
		vars[SelectorID].max = Math.max(d.value,vars[SelectorID].max);
		vars[SelectorID].min = Math.min(d.value,vars[SelectorID].min);
		vars[SelectorID].count++;
		vars[SelectorID].max_diff = Math.max(vars[SelectorID].max_diff,Math.abs(d.value-vars[SelectorID].last_value));
		vars[SelectorID].last_value = d.value;
	    }
	});

	weight = function(a,b){
	    a = a.value,b = b.value; 
	    if(a.max != a.max)
		return -1;
	    if(b.max != b.max)
		return 1;
	    var a_weight = a.count*0.5+(a.max-a.min)*0.25+a.max_diff*0.25;
	    var b_weight = b.count*0.5+(b.max-b.min)*0.25+b.max_diff*0.25;
	    return a_weight-b_weight;
	};

	vars_arr = [];
	d3.keys(vars).map(function(key){
	    vars_arr.push({key:key,
			   value:vars[key]
			  });
	});

	vars_arr.sort(weight);

	width_accum = margin.left;
	height_accum = margin.top;

	getSrc = function(key){
	    src = "./small_plot.html?selectorID="+key+"&selector="+Selector+"&x=lineNum&width="+width+"&height="+height;
	    return src;
	}

	//Sets the properties of iframe.
	getIframe = function(data){
	    var iframe = document.createElement("iframe");
	    
	    var src = getSrc(data.key);
	    iframe.setAttribute("src",src);
	    iframe.width = width+"px";
	    iframe.height = height+"px";
	    iframe.frameBorder = 0;
	    iframe.style.position = "absolute";
	    iframe.style.top = height_accum+"px";
	    iframe.style.left = width_accum+"px";
	    iframe.id = data.key;
	    if((width_accum+width)>max_width){
		width_accum=margin.left;
		height_accum += height;
	    }else{
		width_accum += width;
	    }
	    return iframe;
	};

	child = document.getElementById("p1");
	container = document.getElementById("div1");
	vars_arr.reverse();

	vars_arr.map(function(d,i){
	    iframe = getIframe(d);
	    container.insertBefore(iframe,child);
	});

	sort_function = function(a,b){return a-b;}

	median = function(array){
	    if(array.length<=0)
		return NaN;
	    array.sort(sort_function);
	    if(array.length%2 == 1)
		return array[Math.floor(array.length/2)];
	    else
		return ((array[array.length/2]+array[(array.length/2)-1])/2);
	}

	mean = function(array){
	    sum = 0;
	    array.map(function(d){
		sum += d;
	    });
	    sum /= array.length;
	    return sum;
	};

	summary = function(array){
	    Median = median(array);
	    array.sort(sort_function);
	    length = Math.floor(array.length/2);
	    if(array.length%2 == 0){
		quar_1 = median(array.slice(0,length));
		quar_3 = median(array.slice(length,array.length));
	    }
	    else{
		quar_1 = median(array.slice(0,length));
		quar_3 = median(array.slice(length+1,array.length));
	    }
	    Mean = mean(array);
	    min_max = d3.extent(array);
	    Max = min_max[1];
	    Min = min_max[0];
	    return {
		mean: Mean,
		median:Median,
		quar_1: quar_1,
		quar_3: quar_3,
		max:Max,
		min:Min
	    };
	}

	insertHistogram = function(values,elt){
	    // A formatter for counts.
	    var formatCount = d3.format(",.0f");

	    var margin = {top: 10, right: 20, bottom: 30, left: 20},
	    width = info_width - margin.left - margin.right,
	    height = 120 - margin.top - margin.bottom;

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
		.call(xAxis)
		.selectAll("text")  
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.attr("transform", function(d) {
		    return "rotate(-30)" 
		});
	    
	    console.log(data);
	}

	removeHistogram = function(){
	    if($("svg").length>0)
		d3.selectAll("svg").data([]).exit().remove();
	}

	setItem = function(selector,id){
	    localStorage.setItem("selector",selector);
	    localStorage.setItem("selector_id",id);
	}
	
	showExtra = function(id){
	    html = "";
	    values = [];
	    var ip_obj = [],run_obj = [];
	    var ips_hash = {};
	    run_logs.map(function(d){
		ip = d.ip_num;
		if(ips[ip][Selector]==id){
		    values.push(d.value);
		    if(typeof(ips_hash[ip]) == "undefined"){
			ip_obj.push(ips[ip]);
			run_obj.push(d);
			ips_hash[ip] = 1;
		    }
		}
	    });
	    
	    html += "<div id='div3'>";
	    src = getSrc(id);
	    src = src.replace(/width=.*?&/,'width=1000&');
	    src = src.replace(/height=.*/,'height=500');
	    html += "<a href="+src+" target='_blank'>Large</a>  "+
		"<button type='button' onclick=setItem(\""+Selector+"\","+id+")>Tether</button><br>";
	    valueSig = ip_obj[0].valueSig;
	    type = ip_obj[0].type;
	    dimensionID = ip_obj[0].dimensionID;
	    
	    html += "Name: "+reps[dimensionID].name+"<br>";
	    html += "Variable Type: "+type+"<br>";
	    //behave according to the value signature.
	    //int, long,float, double,short
	    console.log(id,valueSig);
	    numerical = ["I","J","F","D","S"];
	    is_numeric = false;
	    numerical.map(function(b){
		if(valueSig == b)
		    is_numeric = true;
	    });
	    if(is_numeric){
		s = summary(values);
		var f = d3.format(",.2f");
		html += "<table border='1'>";
		html += "<tr>"+
		    "<th>  Min </th>"+
		    "<th>  1st Qu . </th>"+
		    "<th>  Median </th>"+
		    "<th>  Mean </th>"+
		    "<th>  3rd Qu . </th>"+
		    "<th>  Max </th>"+
		    "</tr>";
		html += "<tr>"+
		    "<td>"+f(s.min)+"</td>"+
		    "<td>"+f(s.quar_1)+"</td>"+
		    "<td>"+f(s.median)+"</td>"+
		    "<td>"+f(s.mean)+"</td>"+
		    "<td>"+f(s.quar_3)+"</td>"+
		    "<td>"+f(s.max)+"</td>"+
		    "</tr>";
		html += "</table><br>";
		html += Selector+":  "+id+"<br>";
		
		removeHistogram();
		uniqueVals = values.filter(function(elem, pos) {
		    return values.indexOf(elem) == pos;
		});
		if(uniqueVals.length>1)
		    insertHistogram(values,"#div2");
	    }
	    
	    //string or object
	    else if((valueSig == "C")||(valueSig.search(/L.*/)>-1)){
		removeHistogram();
		counts = [];
		uniqueVals = values.filter(function(elem, pos) {
		    return values.indexOf(elem) == pos;
		});
		values.map(function(elem,pos){
		    if(typeof(counts[elem]) == "undefined")
			counts[elem] = 1;
		    else
			counts[elem]++;
		});
		uniqueVals.sort(function(a,b){return counts[a]-counts[b];});

		html += "# of unique instances: "+uniqueVals.length+"<br>";
		
		html += "Most frequent values are: <br>";
		uniqueVals.reverse();
		
		html += "<ol>";
		for(var i=0;i<uniqueVals.length;i++){
		    d = uniqueVals[i];
		    html += "<li>"+d+" count: "+counts[d]+"</li>";
		    console.log(d);
		    if(i>5)
			break;
		}
		html += "</ol>";
		html += Selector+":  "+id+"<br>";
	    }
	    else if(valueSig == "Z"){
		removeHistogram();
		var true_count = 0,false_count = 0;
		values.map(function(elem){
		    if(elem == "true")
			true_count ++;
		    else if(elem == "false")
			false_count ++;
		});
		html += "<table border='1'><tr><th>true</th><th>false</th></tr>";
		html += "<tr><td>"+true_count+"</td><td>"+false_count+"</td></tr></table>"
		html += Selector+":  "+id+"<br>";

	    }
	    html += "Belongs to: "+"<br>";
	    run_obj.map(function(obj){
		ip = obj.ip_num;
		log = obj.log;
		matches = log.match(/:::.*?:::/g);
		matches.map(function(m){
		    if(m === ":::"+ip+":::")
			log = log.replace(m,"<span style='background-color:red'>*</span>");
		    else
			log = log.replace(m,'*');
		});
		html += log+"<br>";
	    });
	    html += "</div>";
	    $("#div2").html(html);
	}
    }
    render();
});

function handle_storage(e){
    if(!e)
	e=window.event;
    if(e.key=="trigger"){
	var id = parseInt(e.newValue);
	showExtra(id);
    }
}
