Extension for Firefox & Chrome

[Mozilla Addons link](https://addons.mozilla.org/en-GB/firefox/addon/bski-control-video-with-mouse/)  
[Chrome Extensions link](https://addons.mozilla.org/en-US/firefox/addon/bski-control-video-with-mouse)

---  
  
Mouse & Video is an extension that allows you to seek, change volume, speed, switch to fullscreen, by scrolling the mouse wheel on the designated areas in the video player. 


### Start with development:  
 $ npx web-ext run     
 (Optional) Change the variable `let isDebugging = false` to `true`   
 (Optional) Tip: to run in chrome: `$ web-ext run -t chromium`     
 
##### Note
- Chrome requries manifest 3, Firefox on manifest 2.   
- The two manifests manifest.chrome.json and manifest.firefox, I copy and paste that into manifest.json individually then run the build.
