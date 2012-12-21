#target photoshop

// Save the current preferences and set Photoshop to use pixels and display no dialogs
var startRulerUnits = app.preferences.rulerUnits
var startTypeUnits = app.preferences.typeUnits
var startDisplayDialogs = app.displayDialogs
//var startPointSize = app.preferences.pointSize
app.preferences.rulerUnits = Units.POINTS
app.preferences.typeUnits = TypeUnits.POINTS
//app.preferences.pointSize = PointType.POSTSCRIPT
app.displayDialogs = DialogModes.NO

//var outputFolder = Folder.selectDialog("Select a folder to save the images");
//var outputPath = outputFolder.absoluteURI;
//alert(outputPath);

jpgSaveOptions = new JPEGSaveOptions();
jpgSaveOptions.embedColorProfile = true;
jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
jpgSaveOptions.matte = MatteType.NONE;
jpgSaveOptions.quality = 12;

var doc = app.activeDocument;

// set text color options
var textColor = new SolidColor;
textColor.rgb.red = 0;
textColor.rgb.green = 0;
textColor.rgb.blue = 0;

var textSize = (doc.width + doc.height) / 50;
var textOpacity = 15;

//Create text layer with page number
var proofText = doc.artLayers.add();
proofText.kind = LayerKind.TEXT;
proofText.textItem.kind = TextType.PARAGRAPHTEXT;

proofText.textItem.font = "Impact";
proofText.textItem.fauxBold = true;
proofText.textItem.contents = "";          

proofText.textItem.position = [0,0];
proofText.textItem.width = doc.width;
proofText.textItem.height = doc.height;
proofText.textItem.size = textSize;
proofText.textItem.color = textColor;
proofText.textItem.justification = Justification.FULLYJUSTIFIED;
proofText.fillOpacity = textOpacity;

var proofs = [];
for (var i=0; i<300; i++) {
    proofs.push("PROOF");    
}
proofText.textItem.contents = proofs.join(" "); // faster than concantenating string

doc.resizeImage(null, null, 100, ResampleMethod.BICUBIC);
doc.saveAs(new File("~/desktop/" + "PROOF_" + doc.name), jpgSaveOptions, false, Extension.LOWERCASE);
doc.close(SaveOptions.DONOTSAVECHANGES);




// Reset the application preferences
app.preferences.rulerUnits = startRulerUnits
app.preferences.typeUnits = startTypeUnits
//app.preferences.pointSize = startPointSize
app.displayDialogs = startDisplayDialogs