var file_content
var UniqueDims;
var UniqueUnits;
var DimColors=new Array();

//The default is to hide.
var HideSV = true;
var HideInfo = true;
var ShowInstrumented = true;

var plotsize = 260;
var codesize = 360;
var nonesize = 60;

$(document).ready(function() {
    $("#rev_map").change(function(){
	$('*[id^="SV"]').hover(function(){
	    var g = this.onclick.toString();
	    g = g.split("group\(");
	    g = g[1].split("\)");
	    g = g[0]
	    if((($("#rev_map").attr("checked"))?true:false)){
		console.log("set")
		localStorage.setItem("scatter",g)
	    }
	});
    });
    
    $("#menu-nav-check").change(function(){
	if(this.checked){
	    $(".page-wrap").css("width","80%")
	    $(".page-wrap").css("position","relative")
	    $(".plot").attr("width","80%")
	    $("#code_area").attr("width","80%")
	    $(".plot").css("left","20%")
	    $("#code_area").css("left","20%")
	}
	else{
	    $(".page-wrap").css("position","relative")
	    $(".page-wrap").css("width","100%")
	    $(".plot").attr("width","100%")
	    $(".plot").css("left","10px")
	    $("#code_area").css("left","10px")
	    $("#code_area").attr("width","100%")
	}
    });

    $("#plot").change(function(){
	if((this.checked)&&!($("#code").attr('checked')?true:false)){
	    $("#log").css("top",plotsize+"px");
	    $("#log").height((window.innerHeight-plotsize)+"px")
	    console.log("called")
	    //$("menu").width("20%")
	    //$(".toggle-menu").left("20%")
	}

	else if(!($("#code").attr('checked')?true:false)){
	    $("#log").css("top",nonesize+"px");
	    $("#log").height((window.innerHeight-nonesize)+"px")
	}
    });

    $("#code").change(function(){
	if(this.checked){
	    $("#log").css("top",codesize+"px");
	    $("#log").height((window.innerHeight-codesize)+"px")
	    console.log("called")
	    //$("menu").width("20%")
	    //$(".toggle-menu").left("20%")
	}
	else if(!($("#plot").attr('checked')?true:false)){
	    $("#log").css("top",nonesize+"px");
	    $("#log").height((window.innerHeight-nonesize)+"px")
	}
	else if(($("#plot").attr('checked')?true:false)){
	    console.log("should")
	    $("#log").css("top",plotsize+"px");
	    $("#log").height((window.innerHeight-plotsize)+"px")
	}
    });

    $("#log").height((window.innerHeight-nonesize)+"px")
    console.log(window.innerHeight);

    $( "#barchart" ).resizable({});

    $("#barchart").bind("resize", function (event, ui) {
        var setHeight = document.getElementById('barchart').style.height;
	document.getElementById('iframe_plot').style.height = setHeight;
	//document.getElementById('iframe_plot').src = "scatter.html"
	//document.getElementById('iframe_plot').src='bar.html'
        //$('#content).width(1224-setWidth);
        //$('.menu).width(setWidth-6);
    });

    $( "#code_area" ).resizable({});

    $("#code_area").bind("resize", function (event, ui) {
        var setHeight = document.getElementById('code_area').style.height;
	document.getElementById('iframe_code').style.height = setHeight;
	//document.getElementById('iframe_code').src = "scatter.html"
	//document.getElementById('iframe_plot').src='bar.html'
        //$('#content).width(1224-setWidth);
        //$('.menu).width(setWidth-6);
    });
});

function showCode(){
    var obj=document.getElementById("code");
    if(obj.checked){
	document.getElementById("code_area").style.display="block";
//	document.getElementById('log').style.marginTop='410px';
	//document.getElementById("code_area").style.marginTop="100px";
    }
    else{
//	document.getElementById("log").style.marginTop='110px';
	d3.select('#code_area').style('display','none')}
}

function toggleShowPlot(){
    obj = document.getElementById("plot");
    if(!obj.checked){
	/*var sz= document.getElementById('log').style.marginTop.substr(0,3)
	sz = parseInt(sz)
	if(sz==310)//else something else is handling it.
	    document.getElementById('log').style.marginTop='110px';*/
	d3.select('#barchart').style('display','none')}
    else{
	/*var sz= document.getElementById('log').style.marginTop.substr(0,3)
	sz = parseInt(sz)
	console.log(sz)
	if(sz<310)
	    document.getElementById('log').style.marginTop="310px"
	document.getElementById('barchart').style.height='210px';
	document.getElementById('iframe_plot').style.height='206px';*/
	var sel = document.getElementById('graph_type');
	var value = sel.options[sel.selectedIndex].value;
	if(value=='bar')document.getElementById('iframe_plot').src='bar.html';
	else if(value=='scatter')document.getElementById('iframe_plot').src='scatter.html';
	
	//document.getElementById('log').style.marginTop='310px';
	d3.select('#barchart').style('display','block')}
}

function getElementsByClassName(node,classname) {
  if (node.getElementsByClassName) { // use native implementation if available
      return node.getElementsByClassName(classname);
  } else {
    return (function getElementsByClass(searchClass,node) {
        if ( node == null )
          node = document;
        var classElements = [],
            els = node.getElementsByTagName("*"),
            elsLen = els.length,
            pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)"), i, j;

        for (i = 0, j = 0; i < elsLen; i++) {
          if ( pattern.test(els[i].className) ) {
              classElements[j] = els[i];
              j++;
          }
        }
        return classElements;
    })(classname, node);
  }
}

function clear_all(className) {
    var parent = getElementsByClassName(document, 'plot');
    parent=parent[0];
    while(getElementsByClassName(document, className).length>0){
	var elements = getElementsByClassName(document, className);
	n = elements.length;
	for (var i = 0; i < n; i++) {
	    var e = elements[i];
	    if(e)
		e.parentNode.removeChild(e);
	}
    }
}

function filterBy(obj,parameter,parameter_plot,ModePlot,ModeSelect){
    var logs = file_content.split('</br>');
    var ToDisplay = "";
    var first = true;
    var ip_num;
    var log;
    var log_ip;
    if(ModePlot&&(parameter_plot=="bar")){
	dataset = []
	for(var i=0;i<logs.length;i++){
	    if(logs[i].search(/:::SV[0-9]*:::(?:(?!:::).)*:::/)>-1){
		var st = logs[i].match(/:::SV[0-9]*:::(?:(?!:::).)*:::/g);
		st = st.toString();
		iter = st.split(',');
		for(var j=0;j<iter.length;j++){
		    var tags = iter[j].split(":::");
		    if(tags.length<3)
			continue;
		    if(first){
			first = false
		    }
		    ip_num = parseInt(tags[1].slice(2,tags[1].length));
		    for(var s=0;s<ips.length;s++){
			log = ips[s];
			if(log.IPNum == ip_num){
			    break;
			}
		    }
		    if(log==obj){
			log_ip = log;
			dataset.push(parseInt(tags[2]));
		    }
		}
	    }
	}
	var elem=document.getElementById("plot");  
	if(elem.checked){
	    if(document.getElementById('barchart').style.height=="0px")
		document.getElementById('barchart').style.height = "210px";
	    localStorage.setItem("data",dataset);
	    if(document.getElementById("plot").checked){
		document.getElementById("iframe_plot").height="206px";
		document.getElementById("iframe_plot").src="bar.html";
	    }
	}
	document.getElementById("file_name").innerHTML = obj.className;
	localStorage.setItem("file",obj.className);
	//ear_all('bar');	
	//rChart(DimColors[obj.dimensionID]);
	if(!ModeSelect)
	    return;
    }
    if(!ModeSelect)
	return;
    //clear_all('bar');	
    //document.getElementById('barchart').style.height = "0px";
    for(var i=0;i<logs.length;i++){
	if(logs[i].search(/SV[0-9]*/)>-1){
	    var st = logs[i].match(/SV[0-9]*/g)
	    st = st.toString();
	    iter = st.split(',')
	    for(var j=0;j<iter.length;j++){
		var ip_num = parseInt(iter[j].slice(2,iter[j].length));
		var log;
		for(var s=0;s<ips.length;s++){
		    log = ips[s];
		    if(log.IPNum == ip_num){
			break;
		    }
		}
		if(parameter=="class")
		    if(log.className==obj.className)
			ToDisplay+=logs[i]+"</br>";

		if(parameter=="method")
		    if(log.methodName==obj.methodName)
			ToDisplay+=logs[i]+"</br>";
		
		if(parameter=="dim"){
		    if(log.dimensionID==obj.dimensionID){
			ToDisplay+=logs[i]+"</br>";
		    }	
		}
		if(parameter=="unit"){
		    if(log.unit_num==obj.unit_num){
			ToDisplay+=logs[i]+"</br>";
		    }	
		}
		if(parameter=="same"){
		    if(log==obj){
			ToDisplay+=logs[i]+"</br>";
		    }	
		}
		if(parameter=="sig"){
		    if(log.valueSig==obj.valueSig){
			ToDisplay+=logs[i]+"</br>";
		    }	
		}
	    }
	}
    }
    colorizeDims(ToDisplay);
}

function group(j){
    var sel = document.getElementById("action_select");
    var value = sel.options[sel.selectedIndex].value;
    var sel = document.getElementById("graph_type");
    var value_plot = sel.options[sel.selectedIndex].value;
    var ModePlot = document.getElementById("plot_mode").checked;
    var ModeSelect = document.getElementById("select_mode").checked;
    filterBy(ips[j],value,value_plot,ModePlot,ModeSelect);
}

function toggleSV(obj){
    if(obj.checked){
	HideSV = true;
	colorizeDims(UnderDisplay);
    }
    else{
	HideSV = false;
	colorizeDims(UnderDisplay);
    }
}
function toggleInfo(obj){
    if(obj.checked){
	HideInfo = true;
	colorizeDims(UnderDisplay);
    }
    else{
	HideInfo = false;
	colorizeDims(UnderDisplay);
    }
}
function toggleInstrumented(obj){
    if(obj.checked){
	var logs = file_content.split("</br>");
	for(var i=0,line;i<logs.length;i++){
            line = logs[i];
            if(line.search("::SV")>-1)
		filtered_content+=line+"</br>";
	}
	document.getElementById("file").innerHTML = filtered_content;
	colorizeDims(filtered_content);
    }
    else{
	document.getElementById("file").innerHTML = file_content;
	colorizeDims(file_content);
    }
}


function colorizeDims(log){
    line = log;
    var st,ip_num;
    if(line.search(/:::SV[0-9]*:::.*:::/)>-1){
	//This reg expression can even recognize more than one instrumented logs in the same line 
	st = line.match(/:::SV[0-9]*:::(?:(?!(:::)).)*:::/g);
	//TODO: global search over the line will return the matching sub-strings seperated by 'comma' if the string itself contains 'comma' then there is no way to distinguish and hence not coloring such lines.
	st = st.toString();
	var iter = st.split(',');
	if(HideSV){
	    for(var j=0;j<iter.length;j++){
		var tag = iter[j];
		var sv = tag.split(":::");
		if(sv.length<3)
		    continue;
		//console.log(sv)
		var ip_num = parseInt(sv[1].slice(2,sv[1].length));
		var dim;
		var log;

		var s = ip_num;
		if(!s)
		    continue;
		if(!ips[s]){
		    continue;
		}
		dim = ips[s]["dimensionID"];
		/*for(s=0;s<ips.length;s++){
		  log = ips[s];
		  if(log.IPNum == ip_num){
		  dim = log.dimensionID;
		  break;
		  }
		  }*/
		var color;
		for(var m=0;m<UniqueDims.length;m++){
		    if(UniqueDims[m]==dim){
			color = DimColors[m];
		    }
		}
		var r=parseInt(color.substring(1,3),16);
		var g=parseInt(color.substring(3,5),16);
		var b=parseInt(color.substring(5,7),16);
		var mx = (r>g?r:g)>b?(r>g?r:g):b;
		var mn = Math.min(r,g,b);

		if((mx+mn)/512.0>=(0.5)){
		    if(!HideInfo)
			line = line.replace(iter[j],'<span id="SV'+i+'" onclick="group('+s+')" style="background-color:black;color:'+color+'">'+sv[2]+delim+"ClassName:"+ips[s]["className"]+" Method:"+ips[s]["methodName"]+" line: "+ips[s]["lineNum"]+delim+"</span>");
		    if(HideInfo)
			line = line.replace(iter[j],'<span id="SV'+i+'" onclick="group('+s+')" style="background-color:black;color:'+color+'">'+sv[2]+"</span>");
		}
		else{
		    if(!HideInfo)
			line = line.replace(iter[j],'<span id="SV'+i+'" onclick="group('+s+')" style="background-color:white;color:'+color+'">'+sv[2]+delim+"ClassName:"+ips[s]["className"]+" Method:"+ips[s]["methodName"]+" line:"+ips[s]["lineNum"]+delim+"</span>");
		    else
			line = line.replace(iter[j],'<span id="SV'+i+'" onclick="group('+s+')" style="background-color:white;color:'+color+'">'+sv[2]+"</span>");
		}

		
	    }
	}
	else{
	    for(var j=0;j<iter.length;j++){
		var tag = iter[j];
		var sv = tag.split(":::");
		if(sv.length<3)
		    continue;
		var ip_num = parseInt(sv[1].slice(2,sv[1].length));
		var dim;
		var s = ip_num;
		if(!s)
		    continue;
		dim = ips[s]["dimensionID"];
		/*for(s=0,log;s<ips.length;s++){
		  log = ips[s];
		  if(log.IPNum == ip_num){
		  dim = log.dimensionID;
		  break;
		  }
		  }*/
		var color;
		for(var m=0;m<UniqueDims.length;m++){
		    if(UniqueDims[m]==dim){
			color = DimColors[m];
		    }
		}
		
		var r=parseInt(color.substring(1,3),16);
		var g=parseInt(color.substring(3,5),16);
		var b=parseInt(color.substring(5,7),16);
		var mx = (r>g?r:g)>b?(r>g?r:g):b;
		var mn = Math.min(r,g,b);
		//line_num as the id
		//TODO:make this more scalable. I mean HideInfo, HideSV and all.
		if((mx+mn)/512.0>=(0.5)){
		    if(!HideInfo)
			line = line.replace(iter[j],'<span id="SV'+i +'" onclick="group('+s+')" style="background-color:black;color:'+color+'">'+iter[j]+delim+"ClassName:"+ips[s]["className"]+" Method:"+ips[s]["methodName"]+" line:"+ips[s]["lineNum"]+delim+"</span>");		   		
		    else
			line = line.replace(iter[j],'<span id="SV'+i +'" onclick="group('+s+')" style="background-color:black;color:'+color+'">'+iter[j]+"</span>");		   		
		}
		else{
		    if(!HideInfo)
			line = line.replace(iter[j],'<span id="SV'+i+'" onclick="group('+s+')" style="background-color:white;color:'+color+'">'+iter[j]+delim+"ClassName:"+ips[s]["className"]+" Method:"+ips[s]["methodName"]+" line:"+ips[s]["lineNum"]+delim+"</span>");		   
		    else
			line = line.replace(iter[j],'<span id="SV'+i+'" onclick="group('+s+')" style="background-color:white;color:'+color+'">'+iter[j]+"</span>");
		}
	    }
	}
	line = "<span id='line"+ip_num+"'>"+line+"</span>";
    }
    return line;
}

function readMultipleFiles(evt) {
    //Retrieve all the files from the FileList object
    st=new Date().getTime();
    var files = evt.target.files; 
    if (files) {
	for (var i=0, f; f=files[i]; i++) {
	    console.log(f)
	    var r = new FileReader();
	    r.onload = (function(f) {
		return function(e) {
		    var contents = e.target.result;
		    contents = contents.split("\n")
		    file_content = contents;
		};
	    })(f);
	    r.readAsText(f);
	    
	}   
    } else {
	alert("Failed to load files"); 
    }
    et=new Date().getTime();
    console.log("Time to load the file is "+(et-st));
    setTimeout(function(){updateT()},1000);
}

function updateT(){
    var dataView;
    var grid;
    var data = [];
    var once=true;
    
    $(function (){
	var logs = file_content;
	var dims = [2];
	dims.shift();
	for(var i=0,line;i<logs.length;i++){
	    line = logs[i];
	    var st,ip_num;
	    if(line.search("::SV")>-1){
		//This reg exp can handle more than one match in the same line
		st = line.match(/::SV[0-9]*::/g);
		st = st.toString();
		var iter = st.split(',');
		for(var m=0,str;m<iter.length;m++){
		    str=iter[m];
		    var ne = str.slice(4,str.length-2);
		    ip_num = parseInt(ne);
		    for(var j=0,log;j<ips.length;j++){
			log = ips[j];
			if(log.IPNum == ip_num){
			    dims.push(log.dimensionID);
			}
		    }
		}
	    }
	}
	UniqueDims = dims.filter(function(elem, pos) {
	    return dims.indexOf(elem) == pos;
	})
    });

    $(function (){
	if(UniqueDims.length>100)
	    alert("Hey the number of dimensions is too many! I can colorize the values but you can barely distinguish colors;So it is recommended to use grouping rather than relying on coloring");
	DimColors = [];
	col = d3.scale.category10();
	for(var i=0;i<UniqueDims.length;i++)
	    DimColors.push(col(i));
    });

    function waitingFormatter(value) {
	return "wait...";
    }

    function renderColor(cellNode, row, dataContext, colDef) {
	/*var vals = [
	    dataContext["n1"],
	    dataContext["n2"],
	    dataContext["n3"],
	    dataContext["n4"],
	    dataContext["n5"]
	];*/
		
	$(cellNode).html(colorizeDims(dataContext["log"]));
		//$(cellNode).empty().sparkline(vals, {width: "100%"});
    }

    var columns = [{id: "l", name: "log", field: "log",width: 1200, rerenderOnResize: false, asyncPostRender: renderColor}];

    var options = {
	editable: false,
	enableAddRow: false,
	enableCellNavigation: true,
	enableAsyncPostRender: true,
	rowHeight:20,
	
	//text wraping options.
	enableWrap:true,
	wrapAfter:100
    };

    var percentCompleteThreshold = 0;
    var prevPercentCompleteThreshold = 0;
    var h_runfilters = null;

    function myFilter(item, args) {
	if($('#filter').is(':checked')){
	    return (item["log"].search(/:::SV[0-9]*:::(?:(?!:::).)*:::/)>-1);
	}
	else
	    return true;
    }

    function DataItem(i,str) {
	this.num = i;
	this.id = "id_" + i;
	this.log = str;
    }

    $(function () {
	// prepare the data
	/*    for (var i = 0; i < 500000; i++) {
	      data[i] = new DataItem(i);
	      }*/
	file_content.map(function(d,i){data[i]=new DataItem(i,d);/*console.log(data[i]);*/});

	dataView = new Slick.Data.DataView({ inlineFilters: true });
	dataView.setPagingOptions({pageSize:25});
	
	grid = new Slick.Grid("#log", dataView, columns, options);
	grid.registerPlugin(new Slick.AutoTooltips());
	var pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));
	
	// wire up model events to drive the grid
	dataView.onRowCountChanged.subscribe(function (e, args) {
	    grid.updateRowCount();
	    grid.render();
	});

	dataView.onRowsChanged.subscribe(function (e, args) {
	    //grid.log(dataView.getItemByIdx(23));
	    grid.invalidateRows(args.rows);
	    grid.render();
	});
	

	function filterAndUpdate() {
	    //var isNarrowing = percentCompleteThreshold > prevPercentCompleteThreshold;
	    //var isExpanding = percentCompleteThreshold < prevPercentCompleteThreshold;
	    var renderedRange = grid.getRenderedRange();

	    dataView.setFilterArgs();
	    if($('#filter').is(':checked'))
		dataView.setRefreshHints({
		    ignoreDiffsBefore: renderedRange.top,
		    ignoreDiffsAfter: renderedRange.bottom + 1,
		    isFilterNarrowing: true,
		    isFilterExpanding: false
		});
	    else if(filtered)
		dataView.setRefreshHints({
		    ignoreDiffsBefore: renderedRange.top,
		    ignoreDiffsAfter: renderedRange.bottom + 1,
		    isFilterNarrowing: false,
		    isFilterExpanding: true
		});
	    dataView.refresh();

	    //prevPercentCompleteThreshold = percentCompleteThreshold;
	}

	// initialize the model after all the events have been hooked up
	dataView.beginUpdate();
	dataView.setItems(data);
	dataView.setFilter(myFilter);
	//dataView.setFilterArgs(0);
	dataView.endUpdate();
    })
}

function handle_storage(e){
    //alert("called_handle")
    if(!e)
	e=window.event;
    if(e.key=="log_file"){
	highlight_line(e.newValue);
    }
}

function highlight_line(ip){
    ip=parseInt(ip)
    console.log("called")
    //alert("called")
    var logs = filtered_content.split("</br>");
    colorizeDims(filtered_content);
    var ToDisplay="";
    var Found = true;
    var found = false;
    for(var i=0,line;i<logs.length;i++){
	line = logs[i];
	var st,ip_num;
	if(line.search(/:::SV[0-9]*:::.*:::/)>-1){
	    //This reg expression can even recognize more than one instrumented logs in the same line 
	    st = line.match(/:::SV[0-9]*:::(?:(?!:::).)*:::/g);
	    st = st.toString();
	    var iter = st.split(',');
	    for(var j=0;j<iter.length;j++){
		var tag = iter[j];
		var sv = tag.split(":::");
		if(sv.length<3)
		    continue;
		var ip_num = parseInt(sv[1].slice(2,sv[1].length));
		if(ip_num == ip){
		    found = true;
		    break;
		}
		else{
		    continue;
		}
	    }
	    if(found){
		var id = "line"+i;
		var elem = document.getElementById(id);
		elem.className = "selected";
		var position = 0;
		position = elem.offsetTop;//offset().to
		var windowHeight = 300;//$(window).height();
		d3.select("#"+id).transition()
		    .delay(750)
		    .style("background-color", "green");
		d3.select("#"+id).transition()
		    .delay(750)
		    .style("background-color", "white");
		
		//elem.style.color = "white";
		//elem.style.backgroundColor = "black";

		if(position>100)
		    $("#log").scrollTop(position-100);	
		else
		    $("#log").scrollTop(100-position);	
		found = false;
		break;
	    }
	}
    }
    //    colorizeDims(ToDisplay);
    //   document.getElementById("file").innerHTML=ToDisplay;
}
