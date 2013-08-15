//colorizeDims will take as the input contents of the log file and return HTML paresable elements which are colorized accordingly. With WebWorkers it doesn't really return but post the message.

HideSV = true;HideInfo=true;
self.addEventListener('message', function(e) {
    obj = JSON.parse(e.data);
    HideSV=obj.HideSV;
    HideInfo=obj.HideInfo;
    content = obj.content;
    ips = obj.ips;
    UniqueDims=obj.UniqueDims;
    DimColors=obj.DimColors;
    colorizeDims(content);
}, false);

function colorizeDims(content){
    UnderDisplay=content;
    var logs = content.split("</br>");
    var dims = new Array();
    var ToDisplay="";
    var first=true;
    var delim = "  ;;"
    for(var i=0,line;i<logs.length;i++){
	line = logs[i];
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
		    //console.log(ip_num)
		    //console.log(line)
		    //console.log(ips.length)
		    //console.log(logs.length)
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
	    line = "<span id='line"+i+"'>"+line+"</span>";
	}
	if((i!=0)&&(i%100!=0)){
	    ToDisplay+=line+"</br>";
	}
	else{
	    self.postMessage(JSON.stringify({data:ToDisplay,iter:(i/100),end:(i==(logs.length-1))}));
	    ToDisplay='';
	}
	self.postMessage(JSON.stringify({data:ToDisplay,iter:(i/100),end:(i==(logs.length-1))}));
	//This being a worker we cannot use console.
	//console.log(ToDisplay);
    }
    //    document.getElementById("file").innerHTML=ToDisplay;
    //    UnderDisplayHTML = ToDisplay;

    //return (ToDisplay);
    //An event to listen on all updates to LocalStorage.
    //    contextify();
}
