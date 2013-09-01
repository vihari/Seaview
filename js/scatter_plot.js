var st = new Date().getTime()
var w = window.innerWidth;
//var w = 10000;
var h = window.innerHeight;
var lightline = "#A6A2A2";
//all the y part of the points plotted should be incremented by this amount.
var axis = 30;
var padding=50;
var dataset = [100,234,123,21,45,67,89,200,300,350,400];
var com = [];

var mean = makeArrayOf(0,ips.length)
var count = makeArrayOf(0,ips.length)
var cov = makeArrayOf(0,ips.length)

function handle_storage(e){
    //alert("called_handle")
    if(!e)
	e=window.event;
    if(e.key=="scatter"){
	console.log("scatter"+parseInt(e.newValue))
	highlight_circle(parseInt(e.newValue));
    }
}

function highlight_circle(ip){
    console.log("high"+ip)
    var i;
    console.log(dataset)
    for(i=0;i<dataset.length;i++)
	if(ip==dataset[i][2])
	    break;
    var col = cols(ips[ip]["dimensionID"])
    d3.select("#circle"+i).transition()
	.delay(750)
	.attr("style", "fill:"+col);
    d3.select("#circle"+i).transition()
	.delay(750)
	.style("style", "fill:red");
    d3.select("#circle"+i).transition()
	.delay(750)
	.attr("style", "fill:"+col);
    	
    d3.select("#circle"+(i)).attr( "style", "fill:red" );
}

function downlight( data, i, element ) {
    d3.select("#circle"+(i)).attr("stroke", function(d) { return d3.rgb( cols( ips[d[2]]["dimensionID"] )).darker(); });
    d3.select("#line"+(i)).attr("style","stroke:"+lightline)
    d3.select("#hor"+(i)).attr("style","stroke:"+lightline)
}

function highlight( data, i, element ) {
    //    d3.select(element).attr("stroke", function(d) { return d3.rgb( cols( ips[d[2]]["dimensionID"] )).brighter(); });
    d3.select("#line"+(i)).attr("style","stroke:#000000")
    d3.select("#hor"+(i)).attr("style","stroke:#000000")
    d3.select("#circle"+(i)).attr( "stroke", "black" );
}

function makeArrayOf(value, length) {
  var arr = [], i = length;
  while (i--) {
    arr[i] = value;
  }
  return arr;
}

var rad_sum = 0;
//var dim = makeArrayOf(0,ips.length)
function extract_summary(){
    var exclude = -1;
    //logs variable is from SEAVIEW/run.logs.js and info from SEAVIEW/info.js
    logs.map(function(d){if (d.right!=exclude){mean[d.right]+=d.left;count[d.right]++;}});
    mean.map(function(d,i){if(count[i]>0)mean[i]/=count[i];});

    var log_cnt = 0;
    mean.map(function(d,i){if((count[i]>0)&&(ips[i].valueSig==("I"||"J"||"S"||"Z"||"D"||"F")))log_cnt++;})
    for(var i=0;i<mean.length;i++){
	var r = (w-2*padding)/(2*(log_cnt+1));
	com.push([mean[i],(r)/*This is the factor for radius.*/,i])
	rad_sum += r;
    }
    //    console.log("Log count is "+log_cnt);
    
    //filter all those vars that were logged and also is a numerical.
    //those types which may be objects but are implicitly numerical are ignored.
    com = com.filter(function(d,i){return ((count[i]/*&&com[i][0]*/>0)&&(ips[d[2]].valueSig == ("I"||"J"||"S"||"Z"||"D"||"F")))?true:false;})
    
}

var start_time = new Date().getTime();
extract_summary();
var end_time = new Date().getTime();
console.log("Extraction time "+(end_time-start_time));
var mx = com
var start_time = new Date().getTime();
com = com.sort(function(a,b){return (ips[a[2]]["dimensionID"]-ips[b[2]]["dimensionID"]);})
var end_time = new Date().getTime();
console.log("sorting: "+(end_time-start_time));
dataset = com

var start_time = new Date().getTime();
var xScale = d3.scale.linear().clamp(true)
    .domain([padding, w - padding * 2])
    .range([padding, w - padding * 2]).nice();

var mx = -23;
for(var i=0;i<com.length;i++)
    mx=mx>com[i][0]?mx:com[i][0]
var yScale = d3.scale.log()
    .clamp(true)
    .domain([0.1, mx/*d3.max(dataset[0])*/])
    .range([h - padding, padding])
    .nice();

var scale = d3.scale.linear()
    .domain([0,d3.max(dataset[1])])
    .range([30,200]);
var rScale = d3.scale.linear()
    .clamp(true)
    .domain([0, 1])
    .range([0, (w-padding)/(2*rad_sum)])
    .nice();


var sel=d3.select('div#plot')
    .append("svg")
    .attr("width",w)
    .attr("height",h)
    .attr("pointer-events", "all")
  .append('g')
    .call(d3.behavior.zoom().on("zoom", redraw))
  .append('g');

sel.append('svg:rect')
    .attr('width', w)
    .attr('height', h)
    .attr('fill', 'white');
function redraw() {
     sel.attr("transform",
      "translate(" + d3.event.translate + ")"
      + " scale(" + d3.event.scale + ")");
}
var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");
var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left");
var yAxis2 = d3.svg.axis()
    .scale(yScale)
    .orient("right");

var cols = d3.scale.category20();//["red","blue","green","teal","steelblue"];

var xval=[];
var c = 20;
//xval is set such that none of the circles overlap
for (var i=dataset.length-1;i>=0;i--){
    if(i<(dataset.length-1)){
	c+=dataset[i+1][1]+dataset[i][1]/*(rScale(dataset[i+1][1])+rScale(dataset[i][1]))Again if all the circles's radius is same then no rScale.*/
	xval.push(c)
    }
    else
	xval.push(20)
}
xval.reverse()

var m=[];var x = [];
dataset.map(function(d){m.push(d);})
dataset.map(function(d){m.push(d);})
xval.map(function(d){x.push(d);})
xval.map(function(d){x.push(d);})

<<<<<<< HEAD
var start_time = new Date().getTime();
if(isLarge(h)){
    sel.selectAll("line")
	.data(m)
	.enter().append("line")
	.attr("style","stroke:"+lightline)
	.attr("id",function(d,i){
	    if(i<dataset.length)
		return("line"+i)
	    else return("hor"+(i-dataset.length));})
	.attr("x1", function(d,i){
	    if(i<dataset.length)
		return xScale(x[i]);
	    else
		return xScale(0)})
	.attr("x2", function(d,i){
	    if(i<dataset.length)
		return xScale(x[i]);
	    else
		return xScale(w)})
	.attr("y1", function(d,i){
	    if(i<dataset.length){
		var log = [];var ip=d[2]
		logs.map(function(d){if(d.right==ip)log.push(d.left)})
		return yScale(d3.max(log));}
	    else return(yScale(d[0]))})
	.attr("y2",function(d,i){
	    if(i<dataset.length){
		var log = [];var ip=d[2]
		logs.map(function(d){if(d.right==ip)log.push(d.left)})
		return yScale(d3.min(log));}
	    else return(yScale(d[0]))
	})
	.on("mouseover", function(d, i) { highlight( d, i, this ); })
	.on("mouseout", function(d, i) { downlight( d, i, this ); });
}
else{
    sel.selectAll("line")
	.data(dataset)
	.enter().append("line")
	.attr("style","stroke:"+lightline)
	.attr("id",function(d,i){
	    return("line"+i)})
	.attr("x1", function(d,i){
	    return xScale(x[i])})
	.attr("x2", function(d,i){
	    return xScale(x[i])})
	.attr("y1", function(d,i){
	    var log = [];var ip=d[2]
	    logs.map(function(d){if(d.right==ip)log.push(d.left)})
	    return yScale(d3.max(log));})
	.attr("y2",function(d,i){
=======
sel.selectAll("line")
    .data(m)
    .enter().append("line")
    .attr("style","stroke:"+lightline)
    .attr("id",function(d,i){
	if(i<dataset.length)
	return("line"+i)
	else return("hor"+(i-dataset.length));})
    .attr("x1", function(d,i){
	if(i<dataset.length)
	    return xScale(x[i]);
	else
	    return xScale(0)})
    .attr("x2", function(d,i){
	if(i<dataset.length)
	    return xScale(x[i]);
	else
	    return xScale(w)})
    .attr("y1", function(d,i){
	if(i<dataset.length){
	var log = [];var ip=d[2]
	logs.map(function(d){if(d.right==ip)log.push(d.left)})
	return yScale(d3.max(log));}
	else return(yScale(d[0]))})
    .attr("y2",function(d,i){
	if(i<dataset.length){
>>>>>>> master
	    var log = [];var ip=d[2]
	    logs.map(function(d){if(d.right==ip)log.push(d.left)})
	    return yScale(d3.min(log));}
	else return(yScale(d[0]))
    })
    .on("mouseover", function(d, i) { highlight( d, i, this ); })
    .on("mouseout", function(d, i) { downlight( d, i, this ); });

console.log("Line insertions: "+(new Date().getTime()-start_time));
var start_time = new Date().getTime();
var circle = sel.selectAll("circle")
    .data(dataset);

var enter = circle.enter().append("circle")
//    .attr("stroke","black")
    .style("fill",function(d,i){return cols(ips[d[2]]["dimensionID"]);})
    .on("mouseover", function(d, i) { highlight( d, i, this ); })
    .on("mouseout", function(d, i) { downlight( d, i, this ); });   

enter
    .attr("id",function(d,i){return ("circle"+i)})
    .attr("cy", function(d,i){
	return yScale(d[0]);})
    .attr("cx", function(d,i){
	return xScale(xval[i]);})
    .attr("r", function(d,i) {
	return d[1]/*rScale(d[1]);*No scaling is required when the radius is uniform*/});
console.log("Circle insertion: "+(new Date().getTime()-start_time));

sel.append("g")
    .attr("transform", "translate(0," + (h - padding) + ")")
    .call(xAxis);
sel.append("g")
    .attr("transform", "translate(" + padding + ",0)")
    .call(yAxis);
sel.append("g")
    .attr("transform", "translate(" + (w-2*padding) + ",0)")
    .call(yAxis2);

console.log("Time b4 line 281: "+(new Date().getTime()-st));
$('circle').tipsy({ 
    gravity: $.fn.tipsy.autoWE,
    html: true, 
    opacity: 1.0,
    title: function() {
	//On hover display, the max and min values,mean and variance.count and a link to the source code.
        var d = this.__data__, c = cols(d.i);
	var log = [];var dim=ips[d[2]]["dimensionID"];var ip=d[2]
	logs.map(function(d){if(d.right==ip)log.push(d.left)})
	var inf = "Line Number = "+ips[ip]["lineNum"]+"</br>"
	inf += "Method Name: "+ips[ip]["methodName"]+"</br>"
	inf += "Class Name: "+ips[ip]["className"]+"</br>";
	localStorage.setItem("line",log);
	var y = yScale(d[0]);var x = xScale(xval[d.i])
	localStorage.setItem("log_file",ip);
	//log = log.join('</br>');
	var unit_name = unit_names[d[2]]["name"];
	/*var x = "";var chunk = 100;
	for(var i=0;i<(unit_name.length/chunk)+1;i++){
	    x+=unit_name.substr(Math.max((i-1)*chunk,0),i*chunk)+"<br>"
	}
	x+=unit_name.substr(unit_name.length-chunk,unit_name);
	unit_name = x;*/
	unit_name = unit_name.split(";").join(";<br>")
	if(rep_names[unit_mappings[d[2]]]["is_quant_or_ord"])
	    var message = '<div width="150px"><span style="color:white">The max and min values for the selected circle are '+Math.round((d3.max(log)))+','+Math.round(d3.min(log))+" respectively</br>Mean and variance are "+Math.round(d[0]*100)/100+','+Math.round(cov[d[2]]*100)/100+" respectively</br>Count is "+count[ip]+"</br>info"+unit_name+" ip: "+ip+"</span></div>"
	else
	    var message = '<div width="150px"><span style="color:white">The max and min values for the selected circle are '+Math.round((d3.max(log)))+','+Math.round(d3.min(log))+" respectively</br>Mean is "+Math.round(d[0]*100)/100+"</br>Count is "+count[ip]+"</br>info"+unit_name+" ip: "+ip+"</span></div>";
	console.log(message)
	//there is no point in showing the line plot if there are huge number of logs.
	if((count[ip]>2)&&(count[ip]<1000))
            return '<table><tr><td><div width="150px" height="80px"><iframe width="150px" height = "80px" src = "linechart.html" id="iframe_plot"></iframe></div></td><td>'+message+"</td></tr></table>"; 
	else
	    return message; 
    }
});
var end_time = new Date().getTime();
console.log("All the remaining stuff: "+(end_time-start_time));

console.log("Total time: "+(new Date().getTime()-st));

