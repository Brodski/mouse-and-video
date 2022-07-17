Extension for Firefox & Chrome

Mouse & Video is an extension that allows you to seek, change volume, brightness, speed, switch to fullscreen, open the video in a popup window (PIP) simply by scrolling the mouse wheel on the designated areas in the HTML5 video player. 

Feel free to contribute!

### Start with development:  
 1. remove the `min` in `/scripts/background.min.js` and `/scripts/script.min.js` in `manifest.json`
 2. $ web-ext run     
 3. (Optional) Change the variable `let isDebugging = false` to `true`
 Tip: to run in chrome: `$ web-ext run -t chromium`  
### To build, 'compile' and package:  
 1. `$ google-closure-compiler -O SIMPLE --externs ./externs.js --js ./scripts/background.js --js_output_file ./scripts/background.min.js`           
 2. `$ google-closure-compiler -O SIMPLE --externs ./externs.js --js ./scripts/script.js --js_output_file ./scripts/script.min.js`                       
 2. `$ web-ext build --overwrite-dest --ignore-files ./scripts/background.js ./scripts/script.js ./unused-assets`                   
 3. (Reminder) Change the variable `let isDebugging` to `false` 

 
##### Note
- Chrome requries manifest 3, Firefox on manifest 2.   
- The two manifests manifest.chrome.json and manifest.firefox, I copy and paste that into manifest.json individually then run the build.
