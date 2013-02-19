var file_content = new String();
function readMultipleFiles(files) {
    var txtFile = new XMLHttpRequest();
    txtFile.open("GET", "file:///home/sowmya/hello.c", true);
    txtFile.onreadystatechange = function() {
	if (txtFile.readyState === 4) {  // Makes sure the document is ready to parse.
	    if (txtFile.status === 200) {  // Makes sure it's found the file.
		allText = txtFile.responseText; 
		console.log(allText)
		lines = txtFile.responseText.split("\n"); // Will separate each line into an array
	    }
	}
    }
    var fso, ts,s;
    fso = new ActiveXObject("Scripting.FileSystemObject");
    f1 = fso.OpenTextFile("c:\\testfile.txt", 1);
    s = ts.ReadLine();
    txtFile.send(null);
}

/*function readMultipleFiles(files) {
    //Retrieve all the files from the FileList object
    //var files = evt.target.files; 
    if (files) {
        for (var i=0, f; f=files[i]; i++) {
            var r = new FileReader();
            r.onload = (function(f) {
                return function(e) {
                    var contents = e.target.result;
                    contents = contents.split("\n").join("</br>")
                    document.getElementById("file").innerHTML = contents;
                    file_content = contents;
                };
            })(f);
            r.readAsText(f);
	    
        }   
    } else {
	alert("Failed to load files"); 
    }
    console.log(file_content)
    document.getElementById("file").innerHTML = file_content;
    ContentDisplayed = file_content;
//    setTimeout(function(){uniqueDims()},1000);
}*/
