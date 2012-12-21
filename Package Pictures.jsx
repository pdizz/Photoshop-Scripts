#target photoshop

GrowingPacker = function(maxW, maxH) {
    this.maxW = maxW;
    this.maxH = maxH;
};

GrowingPacker.prototype = {

    fit: function(blocks) {
        var n, node, block, len = blocks.length;
        var w = len > 0 ? blocks[0].w : 0;
        var h = len > 0 ? blocks[0].h : 0;
        this.root = {
            x: 0, 
            y: 0, 
            w: w, 
            h: h
        };
    
        for (n = 0; n < len ; n++) {
            block = blocks[n];
            if (node = this.findNode(this.root, block.w, block.h)) {
                block.fit = this.splitNode(node, block.w, block.h);        
            }    
            else {
                block.fit = this.growNode(block.w, block.h);
            }
        }
    },

    findNode: function(root, w, h) {
        if (root.used) {
            return this.findNode(root.right, w, h) || this.findNode(root.down, w, h);
        }
        else if ((w <= root.w && w <= this.maxW) && (h <= root.h && w <= this.maxW)) {
            this.binWidth = this.root.w <= this.maxW ? this.root.w : this.maxW;
            this.binHeight = this.root.h <= this.maxH ? this.root.h : this.maxH;
            return root;
        }
        else {
            return null;
        }
    },

    splitNode: function(node, w, h) {
        node.used = true;
        node.down  = {
            x: node.x,     
            y: node.y + h, 
            w: node.w,     
            h: node.h - h
        };
        node.right = {
            x: node.x + w, 
            y: node.y,     
            w: node.w - w, 
            h: h
        };
        return node;
    },

    growNode: function(w, h) {
        var canGrowRight  = (w <= this.root.w && this.root.w + w <= this.maxW);
        var canGrowDown = (h <= this.root.h && this.root.h + h <= this.maxH);

        if (canGrowRight) {
            return this.growRight(w, h);
        }
        else if (canGrowDown) {
            return this.growDown(w, h);
        }
        else    
            return null; // need to ensure sensible root starting size to avoid this happening
    },

    growRight: function(w, h) {
        this.root = {
            used: true,
            x: 0,
            y: 0,
            w: this.root.w + w,
            h: this.root.h,
            down: this.root,
            right: {
                x: this.root.w, 
                y: 0, 
                w: w, 
                h: this.root.h
            }
        };
        if (node = this.findNode(this.root, w, h))
            return this.splitNode(node, w, h);
        else
            return null;
    },

    growDown: function(w, h) {
        this.root = {
            used: true,
            x: 0,
            y: 0,
            w: this.root.w,
            h: this.root.h + h,
            down:  {
                x: 0, 
                y: this.root.h, 
                w: this.root.w, 
                h: h
            },
            right: this.root
        };
        if (node = this.findNode(this.root, w, h))
            return this.splitNode(node, w, h);
        else
            return null;
    }
}

Packagizer = function(sheetWidth, sheetHeight) {
    this.sheetWidth = sheetWidth;
    this.sheetHeight = sheetHeight;
    this.sheets = [];
    this.nofit = [];
    
    this.run = function(blocks) {
        //remove any blocks that are too big for sheet size and move them to nofit array
        for (var i=blocks.length-1; i>=0; i--) {
            if (blocks[i].w > sheetWidth || blocks[i].h > sheetHeight) {
                this.nofit.unshift(blocks[i]);
                blocks.splice(i, 1);
            }
        }
        
        while(blocks.length) {
            var packer = new GrowingPacker(sheetWidth,sheetHeight);
            packer.fit(blocks);

            var sheet = [];
            for (var i=blocks.length-1; i>=0; i--) {
                if (blocks[i].fit !== undefined && blocks[i].fit !== null) {
                    //console.log(blocks[i].fit);
                    sheet.unshift(blocks[i]);
                    blocks.splice(i,1);
                }
            }

            sheet.sheetWidth = packer.maxW; //Always printing to 10xH. Use packer.binWidth; for WxH
            sheet.sheetHeight = packer.binHeight;
            //console.log(sheet);
            this.sheets.push(sheet);
        }
    }
}


function fit8x10(image) {
    // Resize image to minimum resolution of 200
    if(image.resolution < 200) image.resizeImage(null, null, 200, ResampleMethod.NONE);    
    
    // If the image is in portrait orientation, rotate to landscape orientation
    if (image.width < image.height) {
        image.rotateCanvas(90);
    }

    // Test aspect ratio. If the image is wider than the target ratio, 8x10, resize based on height...
    if (image.height/image.width < 8/10) {
        image.resizeImage(null, UnitValue(8, "inches"), null, ResampleMethod.BICUBIC);
    }
    // ... else resize based on width. This retains as much of the original image as possible when cropping
    else {
        image.resizeImage(UnitValue(10, "inches"), null, null, ResampleMethod.BICUBIC);
    }
    
    // Crop the image to 8x10
    image.resizeCanvas(UnitValue(10, "inches"), UnitValue(8, "inches"), AnchorPosition.MIDDLECENTER);
}

function fitImage(image, w, h) {

    // Test aspect ratio. If the image is wider than the target ratio, resize based on height...
    if (image.height/image.width < h/w) {
        image.resizeImage(null, UnitValue(h, "inches"), null, ResampleMethod.BICUBIC);
    }
    // ... else resize based on width. This retains as much of the original image as possible when cropping
    else {
        image.resizeImage(UnitValue(w, "inches"), null, null, ResampleMethod.BICUBIC);
    }
    
    // Crop the image 
    image.resizeCanvas(UnitValue(w, "inches"), UnitValue(h, "inches"), AnchorPosition.MIDDLECENTER);
}


function compareSheets(sheet1, sheet2) {
    var r = false;
    if (sheet1.length === sheet2.length) {
        for (var i=0; i<sheet1.length; i++) {
            if (sheet1[i].w === sheet2[i].w && sheet1[i].h === sheet2[i].h) {
                r = true;
            }
            else r = false;
        }
    }
    return r;
}

function writeOrder(ID, path) { // Example:     writeOrder(jobID, jobPath);
    var commandFile = new File(path + "/command.nhf");
    commandFile.open("w");
    commandFile.writeln(
        "[Order]\r",
        "JobId=" + ID + "\r",
        "PaperFittingFlag=Shrink\r",
        "CmsFlag=Off\r",
        "BackPrint1=JobID: " + ID + "\r",
        "BackPrint2=Copyright: Lakeshore School Photography 2012\r",
        "\r"
    );
    commandFile.close();
}

function writeFrame(fName, qty, width, type, path) { // Example:     writeFrame(jobID, printQty, frameWidth( in MM!), paperType, jobPath);
    var commandFile = new File(path + "/command.nhf");
    commandFile.open("a");
    commandFile.writeln(
        "[Frame]\r",
        "FrameNum=1\r", // Apparently FrameNum doesn't matter.
        "FileName=" + fName + ".jpg\r",
        "ImageFormat=Jpeg\r",
        "RepeatNum=" + qty + "\r",
        "PaperWidth=254\r",
        "PaperLength=" + width + "\r",
        "Surface=" + type + "\r",
        "\r"
    );
}

//Check if there is an active document. Wont work if nothing is open
if(!documents.length) alert("There is no document open.");

//Run the program
else {
    

        
    //USER INTERFACE
    var maxNodes = 100000;
    var win = new Window("dialog", "Quantities and Settings:", undefined, {closeButton: false});
    win.alignChildren = "center";
    
    //QUANTS
    var quants = win.add("panel");
    quants.add("statictext", undefined, "(Max 100)");
    quants.alignChildren = "right";
    
        var eightGroup = quants.add("group");           
        eightGroup.add("statictext", undefined, "8x10");
        var eightBy = eightGroup.add("edittext", [0,0,40,20], "", {multiline: false});
        eightBy.text = "0";
        eightBy.active = true;
        eightBy.addEventListener ("keyup", function() {
            if (parseInt(eightBy.text) === NaN || parseInt(eightBy.text) > maxNodes) {
                eightBy.graphics.backgroundColor = eightBy.graphics.newBrush (eightBy.graphics.BrushType.SOLID_COLOR, [1, 0, 0]);
                eightBy.text = "0";
            }
            else {
                eightBy.graphics.backgroundColor = eightBy.graphics.newBrush (eightBy.graphics.BrushType.SOLID_COLOR, [1, 1, 1]);
            }
        });
        
        var fiveGroup = quants.add("group");
        fiveGroup.add("statictext", undefined, "5x7");
        var fiveBy = fiveGroup.add("edittext", [0,0,40,20], "", {multiline: false});
        fiveBy.text = "0";
        fiveBy.active = true;
        fiveBy.addEventListener ("keyup", function() {
            if (parseInt(fiveBy.text) === NaN || parseInt(fiveBy.text) > maxNodes) {
                fiveBy.graphics.backgroundColor = fiveBy.graphics.newBrush (fiveBy.graphics.BrushType.SOLID_COLOR, [1, 0, 0]);
                fiveBy.text = "0";
            }
            else {
                fiveBy.graphics.backgroundColor = fiveBy.graphics.newBrush (fiveBy.graphics.BrushType.SOLID_COLOR, [1, 1, 1]);
            }
        });
        
        var threeGroup = quants.add("group");
        threeGroup.add("statictext", undefined, "3x5");
        var threeBy = threeGroup.add("edittext", [0,0,40,20], "", {multiline: false});
        threeBy.text = "0";
        threeBy.active = true;
        threeBy.addEventListener ("keyup", function() {
            if (parseInt(threeBy.text) === NaN || parseInt(threeBy.text) > maxNodes) {
                threeBy.graphics.backgroundColor = threeBy.graphics.newBrush (threeBy.graphics.BrushType.SOLID_COLOR, [1, 0, 0]);
                threeBy.text = "0";
            }
            else {
                threeBy.graphics.backgroundColor = threeBy.graphics.newBrush (threeBy.graphics.BrushType.SOLID_COLOR, [1, 1, 1]);
            }
        });
        
        var walletGroup = quants.add("group");
        walletGroup.add("statictext", undefined, "Wallets");
        var wallets = walletGroup.add("edittext", [0,0,40,20], "", {multiline: false});
        wallets.text = "0";
        wallets.active = true;
        wallets.addEventListener ("keyup", function() {
            if (parseInt(wallets.text) === NaN || parseInt(wallets.text) > maxNodes) {
                wallets.graphics.backgroundColor = wallets.graphics.newBrush (wallets.graphics.BrushType.SOLID_COLOR, [1, 0, 0]);
                wallets.text = "0";
            }
            else {
                wallets.graphics.backgroundColor = wallets.graphics.newBrush (wallets.graphics.BrushType.SOLID_COLOR, [1, 1, 1]);
            }
        });
        
        var miniGroup = quants.add("group");
        miniGroup.add("statictext", undefined, "Mini");
        var minis = miniGroup.add("edittext", [0,0,40,20], "", {multiline: false});
        minis.text = "0";
        minis.active = true;
        minis.addEventListener ("keyup", function() {
            if (parseInt(minis.text) === NaN || parseInt(minis.text) > maxNodes) {
                minis.graphics.backgroundColor = minis.graphics.newBrush (minis.graphics.BrushType.SOLID_COLOR, [1, 0, 0]);
                minis.text = "0";
            }
            else {
                minis.graphics.backgroundColor = minis.graphics.newBrush (minis.graphics.BrushType.SOLID_COLOR, [1, 1, 1]);
            }
        }); //END QUANTS
        
        //SETTINGS
        var radio_group = win.add ("panel");
            radio_group.alignChildren = "left";
            radio_group.add("statictext", undefined, "Paper Type");
            radio_group.add ("radiobutton", undefined, "Luster");
            radio_group.add ("radiobutton", undefined, "Pearl");
            radio_group.add ("radiobutton", undefined, "Type II");
            radio_group.children[1].value = true;
        
        var dotRPanel = win.add("panel");
            dotRPanel.add("statictext", undefined, "Folder Options:");
            var dotR = dotRPanel.add("checkbox", undefined, "Make .r Folder?");
            dotR.value = true;
        
        var submitButton = win.add("button", undefined, "OK", {name: "ok"});
        
    win.show();
    
    //END UI
    
    // START INPUT 
    
    //initialize blocks
    var blocks = [];
    
    //build blocks
    for (var i=0; i<eightBy.text; i++) blocks.push({w: 10, h: 8, r: 0});
    for (var i=0; i<fiveBy.text; i++) blocks.push({w: 5, h: 7, r: 90});
    for (var i=0; i<threeBy.text; i++) blocks.push({w: 5, h: 3.5, r: 0});
    for (var i=0; i<wallets.text; i++) blocks.push({w: 2.5, h: 3.5, r: 90});
    for (var i=0; i<minis.text; i++) blocks.push({w: 2.5, h: 1.75, r: 0});
    
    // set paper type
    function selected_rbutton (rbuttons) {
        for (var i = 0; i < rbuttons.children.length; i++)
        if (rbuttons.children[i].value)
            return rbuttons.children[i].text;
    }
    var paperType;
    switch(selected_rbutton (radio_group)) {
        case "Luster": 
            paperType = 1;
            break;
        case "Pearl": 
            paperType = 2;
            break;
        case "Type II": 
            paperType = 3;
            break;
        default:
            paperType = 1;
    }

    // END INPUT
    
    // START PROGRAM
    
    //if there are no blocks defined, 
    if (!blocks.length) alert("No print package defined");
    else { // run the program
        
        // Save the current preferences
        var startRulerUnits = app.preferences.rulerUnits
        var startTypeUnits = app.preferences.typeUnits
        var startDisplayDialogs = app.displayDialogs

        // Set Photoshop to use pixels and display no dialogs
        app.preferences.rulerUnits = Units.PIXELS
        app.preferences.typeUnits = TypeUnits.PIXELS
        app.displayDialogs = DialogModes.NO

        //set Jpeg Save Options
        jpgSaveOptions = new JPEGSaveOptions();
        jpgSaveOptions.embedColorProfile = true;
        jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
        jpgSaveOptions.matte = MatteType.NONE;
        jpgSaveOptions.quality = 12;    

        /**************Set the path to the hot folder, log folder, and maximum prints allowed*******************/
        var hotFolderPath = "C:/_HOTFOLDER/";
        //var logPath = "C:/_LOG/";
        //var maxPrints = 50;

        //set job ID to time in milliseconds for uniqueness
        var now = new Date();
        var jobID = now.getTime();

        //create job folder
        var jobPath = hotFolderPath + jobID
        var jobFolder = new Folder(jobPath);
        jobFolder.create();
        
        //write command file
        writeOrder(jobID, jobPath);

        // RUN PACKAGER
        var pack = new Packagizer (10,8);
        pack.run(blocks);    
        
        // assign doc
        var doc = app.activeDocument;
        
        //loop through sheets
        for (var i = 0; i < pack.sheets.length; i++) {
            
            var sheet = pack.sheets[i];            
            var sheetW = sheet.sheetWidth * doc.resolution;
            var sheetH = sheet.sheetHeight * doc.resolution;
            
            
            //START sheet optimization (not functioning) if sheet is same as last sheet update qty instead of making new sheet
            //var printQty = 1;
                            
            var newDoc = app.documents.add (sheetW, sheetH, doc.resolution);

            //loop through nodes on sheet
            for (var j=0; j<sheet.length; j++) {
                var node = sheet[j];
                var prevNode = {w:0, h:0};
                if (j > 0) prevNode = sheet[j-1];

                // NODE OPTIMIZATION: if the current node is the same size as the previous node paste using current clipboard
                if (node.w != prevNode.w || node.h != prevNode.h) {    
                    
                    //copy source document to temporary document
                    app.activeDocument = doc;
                    var tmpDoc = doc.duplicate();           
                    
                    //format tmpDoc to correct aspect ratio and rotate.
                    if (node.r === 90) tmpDoc.rotateCanvas(90);      
                    
                    //resize image to node size and copy
                    fitImage(tmpDoc, node.w, node.h);
                    
                    // Select and copy image to clipboard
                    tmpDoc.selection.selectAll();
                    tmpDoc.selection.copy();
                    
                    tmpDoc.close(SaveOptions.DONOTSAVECHANGES); 
                } //END NODE OPTIMIZATION
            
                // define coordinates for placement on sheet
                var nX = node.fit.x * doc.resolution;
                var nY = node.fit.y * doc.resolution;
                var nW = node.w * doc.resolution;
                var nH = node.h * doc.resolution;
                
                // define a selection using coordinates
                var sel = [
                [nX, nY],
                [nX + nW, nY],
                [nX + nW, nY + nH],
                [nX, nY + nH],
                [nX, nY]
                ]; 
                
                // create a new document/sheet
                app.activeDocument = newDoc;
                newDoc.selection.select(sel);            
                // paste the image to target selection
                newDoc.paste(true); // bool true to paste into selection
                newDoc.flatten();      
               
            } //END NODE LOOP


        
            //get paper length (newDoc.height)  in MILLIMETERS for command file
            app.preferences.rulerUnits = Units.MM;
            var paperLength = parseInt(newDoc.height);
            app.preferences.rulerUnits = Units.PIXELS;
            
            //set file name
            fileName = i + "-" + jobID;
            
            //save the sheet and close the document
            newDoc.saveAs(new File(jobPath + "/" + fileName), jpgSaveOptions, true, Extension.LOWERCASE);
            newDoc.close(SaveOptions.DONOTSAVECHANGES);
            
            //write frame to command file
            writeFrame(fileName, printQty, paperLength, paperType, jobPath);

        //END SHEET LOOP
        }
        
        doc.close(SaveOptions.DONOTSAVECHANGES);

        // Append ".r" to job folder if this option is selected in UI
        if(dotR.value) jobFolder.rename(jobID + ".r");

        // Reset the application preferences
        app.preferences.rulerUnits = startRulerUnits;
        app.preferences.typeUnits = startTypeUnits;
        app.displayDialogs = startDisplayDialogs;
    }
}

