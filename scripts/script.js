// Development stuff
function LOG() {
  let isDebugging = true;
// let isDebugging = false;
if (isDebugging) {
  let argz = Array.from(arguments)
  console.log(... argz)
}
}

// }
// Check if there is video on the page. If there is, send a message to the
// background script to show the extension's icon and activate it.
LOG('++++--- EXTENSION LOADED   ----++++ ') // run_at manifest deafult - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_scripts
const minVideoWidth = 400;

const observer = new MutationObserver(function (mutationList, observer) {
if (document.querySelector("video")) {
  chrome.runtime.sendMessage({
    showIcon: true,
  });
  LOG("MUTATION ----------- Found video, sending ")
  LOG(mutationList)
  LOG(observer)
  observer.disconnect();
}
});
const config = { attributes: true, childList: true, subtree: true };
observer.observe(document, config);





//            NETFLIX             ///
//            NETFLIX             ///
//            NETFLIX             ///
// Fix netflix seeking issue
let isNetflix = false;
document.addEventListener("mvNetflix", function (e) {
isNetflix = true;
});
if (location.href.includes("netflix.com")) {
const script = document.createElement("script");
script.textContent = `if (netflix){
  document.dispatchEvent(new CustomEvent('mvNetflix', { isNetflix: true }));
  document.addEventListener('mvNetflixSeek', function (e) {
    const player = netflix.appContext.state.playerApp.getAPI().videoPlayer.
    getVideoPlayerBySessionId(netflix.appContext.state.playerApp.getAPI().
    videoPlayer.getAllPlayerSessionIds()[0])
    player.seek(e.detail)
  })
}`;
(document.head || document.documentElement).appendChild(script);
script.remove();
}


// iframe stuff and pop up stuff
window.addEventListener( "message", (e) => {
  LOG('recieved some message e.data', e.data)
  if (e.data.mv_topIframe) {
    // Tell the top window which iframe to move
    window.top.postMessage({ mv_iframeSrc: window.location.href }, "*");
  }

  if (window.location === window.parent.location) {
    if (e.data.mv_iframeSrc) {
      LOG("gonna pop up!")
      document.mv_popup_element = document.querySelector(`iframe[src="${e.data.mv_iframeSrc}"`);
      document.documentElement.style.overflow = "hidden";
      document.mv_popup_element.className += " popup_style";
      chrome.runtime.sendMessage({
        popup: true,
        acao: "criar", // action: create
      });
    } else if (e.data.mv_closePopup) {
      document.mv_popup_element.classList.remove("popup_style");
      document.documentElement.style.overflow = "revert";
      chrome.runtime.sendMessage({
        popup: true,
        acao: "fechar", // action: close
        activatePopupTab: e.data.activatePopupTab,
      });
    }
  }
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* Receive messages from background script */
/* Kicks off javascript to run the usefull stuff of this extension's purpose */
chrome.runtime.onMessage.addListener(function (message) {
LOG("Content Script - MSG FROM BACKGROUND -", message)
if (message.run) {
  run();
} else if (message.disabled) {
  document.onwheel = null;
  document.pvwm.onwheel = null;
  document.pvwm.mv_on = false;
}
});

let mvObject = {};

chrome.storage.local.get(function (options) {
LOG("Scripts - options", options)
mvObject = {
  left:       options.left          || 5,
  middle:     options.middle        || 2,
  right:      options.right         || 10,
  mode:       options.mode          || "mode_everything",
  volumeRate: options.volumeRate    || 6,
  mute_middle_mouse: options.mute_middle_mouse    || true,
  brightness: 1,
  volume:     0,
  popoutSetting: options.popoutSetting || "disable",

  popup: (action, activatePopupTab) => {
    chrome.runtime.sendMessage({
      popup: true,
      acao: action,
      activatePopupTab: activatePopupTab,
    });
  },
  popupTabOrFullscreen: () => {
    chrome.runtime.sendMessage({
      popoutSetting: options.popoutSetting
    })
  }
};
});

/* Get the top-most iframe in case the video is deep inside nested iframes.
Then we gonna send a message to this iframe which will itself send another message
to the top window with its 'src'.
*/
function getTopIframe(win) {
if (win.parent !== window.top) {
  return getTopIframe(win.parent);
}
return win;
}

// Update values if user changes them in the options
chrome.storage.onChanged.addListener(function (changes) {
LOG("Updating script values...")
LOG("changes", changes)
// LOG("changes[Object.keys(changes)[0]] ", changes[Object.keys(changes)[0]] )
mvObject[Object.keys(changes)[0]] = changes[Object.keys(changes)[0]].newValue;
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
// convert img with src to svg
// https://dev.to/luisaugusto/how-to-convert-image-tags-with-svg-files-into-inline-svg-tags-3jfl
function convertImages(myIconsDict, callback) {
for (const key in myIconsDict) {
  image = myIconsDict[key]
  fetch(image.src)
  .then(res => res.text())
  .then(data => {
    const parser = new DOMParser();
    const svg = parser.parseFromString(data, 'image/svg+xml').querySelector('svg');

    if (image.id) svg.id = image.id;
    if (image.className) svg.classList = image.classList;

    myIconsDict[key] = svg
  })
  .then(callback)
  .catch(error => console.error(error))
}
}

let iconsDict = {}
function setupIcons() {

let iconWrapper = document.createElement("div");
iconWrapper.id= "icon-wrapper"

let seek_ff = document.createElement("img");
let seek_rewind = document.createElement("img");
let vol_decrease = document.createElement("img");
let vol_increase = document.createElement("img");
let vol_mute = document.createElement("img");
let vol_sound = document.createElement("img");
let play_speed = document.createElement("img");

seek_ff.src = browser.runtime.getURL("../icons/seek_ff.svg")
seek_rewind.src = browser.runtime.getURL("../icons/seek_rewind.svg")
vol_decrease.src = browser.runtime.getURL("../icons/vol_decrease.svg")
vol_increase.src = browser.runtime.getURL("../icons/vol_increase.svg")
vol_mute.src = browser.runtime.getURL("../icons/vol_mute.svg")
vol_sound.src = browser.runtime.getURL("../icons/vol_sound.svg")
play_speed.src = browser.runtime.getURL("../icons/play_speed.svg")

seek_ff.id = "seek_ff"
seek_rewind.id = "seek_rewind"
vol_decrease.id = "vol_decrease"
vol_increase.id = "vol_increase"
vol_mute.id = "vol_mute"
vol_sound.id = "vol_sound"
play_speed.id = "play_speed" 

// From dryicons
iconsDict["seek_ff"] = seek_ff;
iconsDict["seek_rewind"] = seek_rewind;
iconsDict["vol_decrease"] = vol_decrease;
iconsDict["vol_increase"] = vol_increase;
iconsDict["vol_mute"] = vol_mute;
iconsDict["vol_sound"] = vol_sound;
iconsDict["play_speed"] = play_speed;
document.body.append(iconWrapper)
convertImages(iconsDict, ()=>{} )
}

function setupStyles() {
let stylez = document.createElement("style");
document.body.append(stylez)
stylez.innerHTML = `
  .volume-icon {
    position: absolute;
    display: inline-flex;
  }
  #icon-wrapper {
    position: absolute;
    z-index: 999;
  }

  #icon-wrapper svg,
  #icon-wrapper img,
  #icon-wrapper span {
    position: absolute;
    height: 14px;
    width: 14px;
    pointer-events: none; 
    opacity: 0;
    filter: drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));
  }    
  #icon-wrapper span {
    color: white;
    left: calc(16px + 4px);
    font-size: 12px;
    white-space: nowrap;
  }
  #icon-wrapper svg path {
    fill: white;
  }    
  .fade-icon-out, 
  .fade-icon-out svg, 
  .fade-icon-out span {
    animation: fadeOut ease 1.75s;
  }
  @keyframes fadeOut {
    0% {
      opacity: .9;
    }
    100% {
      opacity:0;
    }
  }
  #icon-wrapper .disp-block {
    display: block;
  }
  .stop-scrolling {
    height: 100%;
    overflow: hidden;
  }
`
}


function getAllWrapingEles(vid, ancestor) {
if (vid.clientWidth < minVideoWidth) { // video too small
  return false
}
function getAllSiblings(ele) {
  let siblings = [ele]
  let tempEle = ele
  
  while (tempEle.previousElementSibling) {
    siblings.push(tempEle.previousElementSibling)
    tempEle = tempEle.previousElementSibling
  }
  tempEle = ele
  while (tempEle.nextElementSibling) {
    siblings.push(tempEle.nextElementSibling)
    tempEle = tempEle.nextElementSibling
  }
  return siblings
}

let allWrappingEles = getAllSiblings(ancestor)
// LOG(allWrappingEles)
// LOG("==> getAllWrapingEles()")
// LOG("THE VID")
// LOG(vid)
// LOG("vvvvvvvvvvvvvvvvvvvvvvvvvvvv")
// LOG("vid.width=" + vid.getBoundingClientRect().width )
// LOG("vid.height="+ vid.getBoundingClientRect().height)  
// LOG("vid.offsetLeft=" + vid.offsetLeft )
// LOG("vid.offsetHeight="+ vid.offsetHeight )  
// LOG("^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
for ( let ele of allWrappingEles) {
  if (vid.getBoundingClientRect().width == ele.getBoundingClientRect().width  
    && vid.getBoundingClientRect().height == ele.getBoundingClientRect().height
    && vid.offsetLeft == ele.offsetLeft
    && vid.offsetHeight == ele.offsetHeight)  {
      LOG(" ✔✔✔✔✔ Adding candidate")
      ele.videoReference = vid
  } else {
    LOG(" X X X X NOT adding candidate")
  }
}


}

function getAllWrapingElesAux() {
let i = 0;
for (const vid of document.querySelectorAll("video")) {
  getAllWrapingEles(vid, vid.parentElement )
  i++
}
}

function setUpElementWithVideo(e, vid) {
e.preventDefault()
LOG("Setting up Element with video ....... start 1 ")
document.mv_popup_element = vid;


/* Popup - This will be used to know where to place the element when the popup closes. 'hasPlaceholder' is used so that a new 'div' won't be created when the video is in the popup. */
if (!vid.hasPlaceholder) {
  vid.hasPlaceholder = true;
  document.mv_placeholder = document.createElement("div");
  document.mv_popup_element.parentNode.insertBefore(document.mv_placeholder,document.mv_popup_element);
}  

/* This is a flag to skip this video because we already atached the wheel function to it */  
e.target.mv_on = true;
// Attach the onwheel function and then dispatch it.
e.target.onwheel = (e) => wheel(e, vid);
document.pvwm = e.target;
LOG("Setting up Element with video ....... complete 2")
wheel(e, vid);
}

// When we scroll the wheel an event is fired from the cursor position. We check if the cursor is ontop of a video.
// Sometimes elements are wrapping the video such that the event (specifically, event.target) won't 'see' the <video>
// element and instead see the wrapper.
function getVidIfPresent(e) {
LOG("SHORTCUT FINDER!")

// if (!document.mv_pause_function && !e.target.mv_on && !e.target.isNotAVideoWrapper) {
if (!document.mv_pause_function && !e.target.isNotAVideoWrapper) {
  if (e.target.tagName == "VIDEO") {
    LOG("SHORTCUT FINDER - vidElement")
    return { "type": "videoElement"}
  }
  if (e.target.videoReference) {
    LOG("SHORTCUT FINDER - videoReference")
    return { "type": "videoReference" }      
  }
  
  for (const vid of document.querySelectorAll("video")) {
    if (vid.clientWidth < minVideoWidth) {
      LOG(".....video too small")
      continue
    }
    
    if (
      e.clientY >= vid.getBoundingClientRect().y 
      && e.clientY <= vid.getBoundingClientRect().y + vid.clientHeight 
      && e.clientX >= vid.getBoundingClientRect().x 
      && e.clientX <= vid.getBoundingClientRect().x + vid.clientWidth 
    ) {
      LOG("SHORTCUT FINDER - longsearch")
      return { "type": "longSearch", "vid": vid  }
    }
  }
  e.target.isNotAVideoWrapper = true; // prevents unneccessary running code. ... a little
  LOG("SHORTCUT FINDER - nothing")
}
}




// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
function run() {
LOG("!!!!!! IN RUN !!!!!!")
getAllWrapingElesAux() 
setupStyles()
setupIcons()
window.addEventListener('wheel', main);
window.addEventListener('mousedown', muteMiddleClick)


function main(e) {
  /* document.mv_pause_main is useful when transitioning to the popup. Otherwise document.mv_popup_element will change when scrolling too fast */
  LOG("-------> MAIN! aka document.WHEEL!< -----------")
      
  if (e.target.clientWidth < minVideoWidth || e.target.mv_on == true) {
    return false
  }

  // Problem: Vids will scroll on 1st mouse wheel event for some reason.
  // Solutions: This isnt bulletproof, but works w/ imperfections. Better than an unexpected full scroll imo.
  const preventStrangeScroll = () => {
    let scrollbarWidth = window.innerWidth - document.documentElement.clientWidth; //  https://muffinman.io/blog/get-scrollbar-width-in-javascript/
    let prevPadding = document.body.style.padding
    let tempPadding = 'calc(' + document.body.style.padding + " " + scrollbarWidth + 'px)'

    document.body.classList.add("stop-scrolling")
    document.body.style.paddingRight = tempPadding
    setTimeout( () => {
      document.body.classList.remove("stop-scrolling")
      document.body.style.paddingRight = prevPadding
    }, 1) // not actually 1ms, some say it's 4ms, others say it will run once the stack is available

  }
  
  // This section could be better (A)
  let shortcut = getVidIfPresent(e)
  let vid = null
  if ( shortcut == null ) {
    LOG("Script - VIDEO NULL - nothing ")
    return
  }    
  if ( shortcut.type == "videoElement" ) {
    vid = e.target
    LOG("Script - VIDEO - Found video refrence - fast 1")
  }
  if ( shortcut.type == "videoReference" ) {
    vid = e.target.videoReference
    LOG("Script - VIDEOREFERENCE - Found video refrence - fast 2")
  }
  if ( shortcut.type == "longSearch") {
    vid = shortcut.vid
    LOG("Script - Found for video refrence - slow 2")
  }
  if ( vid != null) {
    preventStrangeScroll()
    setUpElementWithVideo(e, vid)
  }

}


function muteMiddleClick(e) {
  // If we already computed it, or not a middle mouse click, or if element is too small
  if ( e.target.mute_on || e.button != 1 || e.target.clientWidth < minVideoWidth ) {
    return
  }


  let shortcut = getVidIfPresent(e) 
  let vid = null
  if ( shortcut == null ) {
    LOG("Script - MUTE NULL - nothing ")
    return
  }    

// This section could be better (B)
  if ( shortcut.type == "videoElement" ) {
    LOG("Script - MUTE NULL - videoElement ")
    vid = e.target
  }
  if ( shortcut.type == "videoReference" ) {
    LOG("Script - MUTE NULL - videoReference ")
    vid = e.target.videoReference
  }
  if ( shortcut.type == "longSearch") {
    LOG("Script - MUTE NULL - longSearch ")
    vid = shortcut.vid
  }
  if (vid != null) {
    LOG("Script - MUTE DOING SOMETHING - GOGOG ")
    e.preventDefault()
    e.target.mute_on = true;
    e.target.addEventListener('mousedown', (e) => { doMute(e, vid) })
    doMute(e, vid)
  }
    
}
}
























function wheel(e, vid) {
if (document.mv_pause_function) {
  LOG("WHEELPAUSE FUNCTION")
  return
}  
LOG("WHEEL EVENT")
e.preventDefault();
e.stopPropagation();

const cX = e.clientX - Math.round(vid.getBoundingClientRect().x);
const delta = e.deltaY;

if (e.shiftKey) {
  setBrightness(delta, vid);
  return
} 

LOG("MODE: ", mvObject.mode)

// Change time position
if (mvObject.mode === "mode_seek_middle") {          
  LOG("-------> SKIP 1")
  vid.currentTime += getIncrement(delta, mvObject.middle);

// Skip only
} else if (mvObject.mode === "mode_seek_only") {          
  LOG("-------> SKIP 2")
  seekVideoByAreas(cX, delta, vid);

// Volume only
} else if (mvObject.mode === "mode_volume") {
  LOG("-------> VOLUME")
  changeVolume(delta, vid);

// Default to Everything mode (volume, seek)
} else { // mvObject.mode ===  mode_everything

  // bottom half
  if (e.offsetY <= vid.clientHeight / 2) {
    if (cX < vid.clientWidth - (90 / 100) * vid.clientWidth) {        
      LOG("-------> POP UP")
      controlPopoutEvent({delta, vid, e})

    } else if (cX > vid.clientWidth - (10 / 100) * vid.clientWidth) {  
      LOG("-------> SPEED")
      changePlaybackRate(delta, vid);
    } else {  
      LOG("-------> VOLUME 2")
      changeVolume(delta, vid);
    }

  // top half
  } 
  else { 
    LOG("-------> SKIP 3")
    seekVideoByAreas(cX, delta, vid);
  }
}


}


///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////

// Rewind, fast forward, volume up, volume down, and mute all below in next few methods
function displayIcon(iconName, msg, video) {

let span = document.createElement("span")
span.innerText = msg

// put the element on the screen, then give a fade away styling
let iconWrapper = document.getElementById("icon-wrapper")  
iconWrapper.innerHTML = iconsDict[iconName].outerHTML + span.outerHTML
iconWrapper.classList.remove("fade-icon-out")
iconWrapper.classList.add("fade-icon-out")

// Place icon in top left of video
let scrollLeft = window.pageXOffset || video.scrollLeft
let scrollTop = window.pageYOffset || video.scrollTop
let vidTop  = video.getClientRects()[0].top + scrollTop
let vidLeft = video.getClientRects()[0].left + scrollLeft
iconWrapper.style.top = vidTop + 'px'
iconWrapper.style.left = vidLeft +'px'
document.body.appendChild(iconWrapper);
}

function doMute(e, vid) { 
if ( e.button == 1 ) {
  e.preventDefault();
  vid.muted = !vid.muted 
  vid.muted == true ? displayIcon("vol_mute", "", vid) :  displayIcon("vol_sound", "", vid)
}
}
function changeVolume(delta, video) {
LOG("Script - VOLUME - volume change")
if (video.muted) {
  video.muted = false;
}
// HERE 
if (delta < 0) {
  let msg = (video.volume + mvObject.volumeRate * 0.01).toFixed(2)
  displayIcon("vol_increase", msg, video)
} else { 
  let msg = (video.volume - mvObject.volumeRate * 0.01).toFixed(2)
  displayIcon("vol_decrease", msg, video)
}

mvObject.volume = video.volume;
let deltaVolume = delta < 0 ? 1 * (0.01 * mvObject.volumeRate) : -1 * (0.01 * mvObject.volumeRate);

if (delta < 0  && deltaVolume + mvObject.volume >= 1 ) {
  mvObject.volume = 1;
} 
else if (delta > 0  && deltaVolume + mvObject.volume <= 0 ) {
  mvObject.volume = 0;
} 
else {
  mvObject.volume += 1 * (delta < 0 ? 1 * (0.01 * mvObject.volumeRate) : -1 * (0.01 * mvObject.volumeRate));
}
video.volume = parseFloat( Math.min(Math.max(mvObject.volume, 0), 1).toFixed(2) );
}

function changePlaybackRate(delta, video) {
let firstMov = delta;
setTimeout( function (mov) {
    if (firstMov !== mov) {
      video.playbackRate = video.defaultPlaybackRate;
    }
  },150, firstMov );

video.playbackRate += 1 * (delta < 0 ? 1 * 0.25 : -1 * 0.25);

let playback = parseFloat( Math.min(Math.max(video.playbackRate, 0.25), 4).toFixed(2) );
displayIcon("play_speed", playback, video )
video.playbackRate = playback;
}



function seekVideoByAreas(cX, delta, video) {
let seekTo = video.currentTime;
let rate;
const neet2Digits = (num) => { 
  return num < 10 ? "0" + num : num
}
const getIncrement = (delta, rate) => {
  return 1 * (delta < 0 ? 1 * rate : -1 * rate);
}
const getSeekAndRate = () => {
  if (cX <= video.clientWidth / 3) {
    rate = mvObject.left
    seekTo += getIncrement(delta, mvObject.left);
  } else if ( cX > video.clientWidth / 3 && cX <= (video.clientWidth / 3) * 2 ) {
    rate = mvObject.middle
    seekTo += getIncrement(delta, mvObject.middle);
  } else {
    rate = mvObject.right
    seekTo += getIncrement(delta, mvObject.right);
  }
  seekTo = seekTo < 0 ? 0 : seekTo;
  return seekTo
}

seekTo = getSeekAndRate()
if (!isNetflix) {
  seekTo2 =  Math.floor(seekTo)
  let seconds = seekTo2 % 60
  let minutes = Math.floor((seekTo2 / 60))
  let hours = Math.floor((seekTo2 / 3600)) 
  let time = null;
  if (seekTo >= 3600) { // 1 hour = 60 * 60
    time = hours + ":" + neet2Digits(minutes - 60*hours) + ":" + neet2Digits(seconds) // ex) 1:23:45
  }
  else {
    time = neet2Digits(minutes) + ":" + neet2Digits(seconds) // ex) 01:23
  }
  rate = delta < 0 ? "+" + rate :  "-" + rate
  delta < 0 ? displayIcon("seek_ff", `${time} (${rate}) `, video) : displayIcon("seek_rewind", `${time} (${rate})`, video)    
  video.currentTime = seekTo;
}  
else if (isNetflix) {
  document.dispatchEvent( new CustomEvent("mvNetflixSeek", { detail: parseInt(seekTo) * 1000 }) ); // milliseconds
} 
}
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
///////////////                                                         ///////////////
















//  pop up
//  pop up
//  pop up
//  pop up
//  pop up
//  pop up
//  pop up
//  pop up
//  pop up
//  pop up
//  pop up
//  pop up
function close_popup(activatePopupTab) {
LOG("===============> CLOSING POP UP")
document.mv_playing_on_popup = false;

// Pause execution of the wheel function while transitioning out of popup
document.mv_pause_function = true;

// Iframe check
if (window.location !== window.parent.location) {
  // The page is in an iframe
  window.top.postMessage(
    {
      mv_closePopup: true,
      activatePopupTab: activatePopupTab,
    }, 
    "*" 
  );
} else {
  mvObject.popup("fechar", activatePopupTab);
}

// Show scrollbar
document.documentElement.style.overflow = "revert";
if (document.mv_popup_element.defaultControls != null) {
  document.mv_popup_element.controls = document.mv_popup_element.defaultControls 
}
// Remove play/pause onclick event
document.mv_popup_element.onclick = null;
document.mv_popup_element.classList.remove("popup_style");

// Place video back in original position
document.mv_placeholder.insertAdjacentElement("afterend",document.mv_popup_element);

// Add delay to prevent fullscreen from happening when closing the popup
setTimeout(() => {
  // document.mv_popup_element.scrollIntoView();
  document.mv_pause_function = false;
}, 500);
}

function open_popup(isFullscreen) {
LOG("IN OPEN POPUP")
if (document.mv_playing_on_popup) {
  LOG("open_popup - going to clsoe it 1")
  close_popup(false);
} 
else if (!document.mv_playing_on_popup) {
  document.mv_playing_on_popup = true;

  // Pause execution of the wheel function while transitioning to popup
  document.mv_pause_function = true;
  // Hide scrollbar
  document.documentElement.style.overflow = "hidden";

  document.mv_popup_element.className += " popup_style";
  document.body.insertBefore( document.mv_popup_element,document.body.firstChild );
  document.mv_popup_element.defaultControls = document.mv_popup_element.controls
  document.mv_popup_element.controls = true
  
  // Add an event listener to play/pause video when clicking on it
  document.mv_popup_element.onclick = () => {
    !document.mv_popup_element.paused ? document.mv_popup_element.pause() : document.mv_popup_element.play();
  };

  setTimeout(() => {
    document.mv_pause_function = false;
  }, 500);

  // Check if video is inside an iframe
  if (window.location !== window.parent.location) {
    // The page is in an iframe
    getTopIframe(window).postMessage({ mv_topIframe: true }, "*");
  } else {
    LOG("open_popup - Sending message to background script")
    if(!isFullscreen) { mvObject.popup("criar") };
    document.body.onfullscreenchange = null;
  }
}
}


function setBrightness(delta, vid) {
mvObject.brightness += 1 * (delta < 0 ? 1 * 0.1 : -1 * 0.1);
mvObject.brightness = parseFloat(
  Math.min(Math.max(mvObject.brightness, 0), 1).toFixed(1)
);
vid.style.filter = "brightness(" + mvObject.brightness + ")";
}

async function controlPopoutEvent(data) {
LOG("1 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ controlPopoutEvent")

let {delta, vid, e} = data

if (mvObject.popoutSetting == "pip"){
  LOG("controlPopoutEvent - GOING IN POP UP")
  activatePopupFeature(delta, vid, e)
}
if (mvObject.popoutSetting == "fullscreen"){
  activateFullScreen()
}
if (mvObject.popoutSetting == "disabled"){
  // do nothing
}
LOG("2 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ controlPopoutEvent")
}


function activateFullScreen() {
open_popup(true);
}

function activatePopupFeature(delta, vid, e) {
if (delta > 0) {
  // Close popup and stay on the current tab
  if (document.mv_playing_on_popup) {
    LOG("open +1")
    close_popup(false);
  } else {
    // The popup must open only when the video is not in fullscreen mode.
    if (document.fullscreenElement) {
      LOG("open +2")
      document.exitFullscreen();

      // We need this so that when the user scrolls out of fullscreen the popup doesn't open up unwantedly
      document.mv_pause_function = true;
      setTimeout(() => { document.mv_pause_function = false;}, 500);
    } else {
      LOG("open +3")
      open_popup();
    }
  }
} else if (delta < 0) {
  LOG(" activatePopupFeature- !!!")
  // Close popup and move to the tab playing the video
  if (document.mv_playing_on_popup) {
    LOG("close -1")
    close_popup(false);
  
  } else {
    if (document.fullscreenElement == null) {
      (function (x) {
        setTimeout(function () {
          if (document.fullscreenElement == null) {
            LOG("close -2")
            const attribs = [ ...document.elementsFromPoint(e.x, e.y)
                .filter( (el) => (el.contains(vid) && el.clientWidth === e.target.clientWidth) || el.clientHeight === e.target.clientHeight )
                .pop()
                .querySelectorAll("*"),
            ]
              .map((node) => [...node.attributes])
              .reduce((acc, cur) => acc.concat(cur), [])
              .filter( (attrib) => 
                  attrib.nodeValue
                    .toLowerCase()
                    .replace(" ", "")
                    .indexOf("fullscreen") >= 0
              )
              .filter( (attrib) => attrib.ownerElement.clientWidth !== x.clientWidth && attrib.ownerElement.clientHeight !== x.clientHeight );
              
            LOG("close -2.1", attribs)
            for (const x of attribs) {
              try {
                if (document.fullscreenElement == null)
                  x.ownerElement.click();
              } catch (e) {}
            }
            setTimeout(() => {
              if (document.fullscreenElement == null) {
                x.requestFullscreen();
              }
            }, 100);
          }
        }, 100);
      })(vid);
    }
  }
}
}