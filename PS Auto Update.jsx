if(app.name == "Adobe Photoshop") {
    var scriptPath = "V:/_INHOUSE SOFTWARE/PHOTOSHOP_SCRIPTS/";
    var savePath = app.path + "/Presets/Scripts/";

    var updateFolder = new Folder(scriptPath);
    var updateFiles = updateFolder.getFiles("*.jsx");

    var copyError = "";

    for (var i=0; i<updateFiles.length; i++) {
        var file = updateFiles[i];
        if(!file.copy(savePath + file.name)) copyError += (file.displayName + ", ");
    }

    if (copyError.length > 0) alert("Error updating " + copyError + "contact administrator.");
}