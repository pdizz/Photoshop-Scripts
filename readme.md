Adobe Photoshop API scripts written in JavaScript
Copyright (c) 2012 Pete Albrecht

Run scripts either in Photoshop by selecting File > Scripts > Browse > .jsx file
or through Extendscript toolkit debugger.


Batch Files.jsx
- Boilerplate for batch processing entire folder of images.

Get Selection Coordinate Points.jsx
- Answer to Stack Overflow question:
  http://stackoverflow.com/questions/8505207/getting-all-polygon-coordinates-of-specific-area-of-image/10639215#10639215
- Converts selection to work-path and iterates through each path point
  outputting it's coordinate points to a text file
- Set stride to reduce number of output points to manageable level for complex selections

Make Proof.jsx
- Makes low-resolution copy of current document and overlay with "proof" watermark
- "proof" font sized relative to image size

Package Pictures.jsx
- Package multiple images to fixed-width, variable length sheets for printing to roll-paper
- Binary tree bin packing algorithm based on http://codeincomplete.com/posts/2011/5/7/bin_packing/
- Apologies for UI copy-pasta :P

PS Auto Update.jsx
- Photoshop startup script to copy contents of scripts folder to Adobe/Photoshop/Presets/Scripts
  folder to "install" scripts and keep them updated every time you start Photoshop

