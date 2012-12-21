#target photoshop

jpgSaveOptions = new JPEGSaveOptions();
jpgSaveOptions.embedColorProfile = true;
jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
jpgSaveOptions.matte = MatteType.NONE;
jpgSaveOptions.quality = 12;

var fileList = File.openDialog ('Select file/files', '*.*', true);

if (!fileList.length) alert("Some other time then...");
else {
    for (var i=0; i<fileList.length; i++) {
        var doc = open(fileList[i]);
        
        //doc.doSomething();
        
        doc.saveAs(new File(doc.path + "/_BATCHED_" + doc.name), jpgSaveOptions, true, Extension.LOWERCASE);
        doc.close(SaveOptions.DONOTSAVECHANGES);
    }
}