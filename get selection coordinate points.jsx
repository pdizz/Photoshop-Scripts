#target photoshop

// Save the current unit preferences (optional)
var startRulerUnits = app.preferences.rulerUnits
var startTypeUnits = app.preferences.typeUnits

// Set units to PIXELS
app.preferences.rulerUnits = Units.PIXELS
app.preferences.typeUnits = TypeUnits.PIXELS

// Use the top-most document
var doc = app.activeDocument; 

// Turn the selection into a work path and assign to wPath
doc.selection.makeWorkPath(0); // set tolerance (in pixels). 0 for sharp corners
var wPath = doc.pathItems['Work Path'];

var coords = new File("~/Desktop/coords.txt");
coords.open("w");

var stride = 1; // 2 means every 2nd, 3 means every 3rd, etc. Minimum 1

// Loop through all path points and add their anchor coordinates to the output text
for (var i=0; i<wPath.subPathItems[0].pathPoints.length; i++) {
	if (i % stride === 0) {
		coords.writeln(wPath.subPathItems[0].pathPoints[i].anchor);
	}
}

coords.close();

// Alert the output text
//alert(coords);


// Remove the work path
wPath.remove();




// Reset to previous unit prefs (optional)
app.preferences.rulerUnits = startRulerUnits;
app.preferences.typeUnits = startTypeUnits;

