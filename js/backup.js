var dataset = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
		11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ];
var datas = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
	      11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ,34,45,67,8,9,0,5,7,9,9,35,356,78,876,43,245,234,53,134,13,1,45,1,45,25,1,35,5312,1,3454,1454,1,434,1,451];
var neat = d3.scale.linear()
    .domain([0, d3.max(dataset)])
    .range(["0px","50px"]);
function barChart(col){
//    getElementsByClassName('bar')[0].style.background-color = col;
    d3.select("div#barchart").selectAll("div")
	.data(dataset)
	.enter()
	.append("div")
	.attr("class", "bar")
	.attr("height", neat)
	.style("height",function(d) {
	    if(d3.max(dataset)==d3.min(dataset))
		var scale = "150px";
	    else
		var scale = Math.floor(150*d/(d3.max(dataset)-d3.min(dataset)))+"px";
	    return(scale);
	})
	.attr("dx", 3) // padding-left
	.attr("dy", ".35em") // vertical-align: middle
	.attr("text-anchor", "start") // text-align: right
	.attr("fill", "black")
	.attr("stroke", "none")
	.text(function(d){return d;})
	.style("width",function(d) {
	    var scale = 1060/dataset.length+"px";
	    return scale;
	});
	
}
