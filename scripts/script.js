// Development stuff
// let isDebugging = true;
// function LOG() {
//   let argz = Array.from(arguments)
//   if (isDebugging) {
//     //console.log(... argz)
//   }
//     else if (isDebugging == false) {
//     //console.log = function (... argz) { return };
//   }
// }



// Check if there is video on the page. If there is, send a message to the
// background script to show the extension's icon and activate it.
////console.log('++++--- EXTENSION LOADED 123  ----++++ ') // run_at manifest deafult - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_scripts
const minVideoWidth = 415;


(function () {
  ////console.log("GO!")
  // window.addEventListener('DOMContentLoaded', (event) => {
    if (document.querySelector("video")) {
      chrome.runtime.sendMessage({
        showIcon: true,
      });
    }
    else {
      const observer = new MutationObserver(function (mutationList, observer) {
        if (document.querySelector("video")) {
          chrome.runtime.sendMessage({
            showIcon: true,
          });
          ////console.log("MUTATION ----------- Found video, sending ")
          ////console.log(mutationList)
          ////console.log(observer)
          observer.disconnect();
        }
      });
      const config = { attributes: true, childList: true, subtree: true };
      observer.observe(document, config);
    }
  // })
}())
  
// const observer = new MutationObserver(function (mutationList, observer) {
//   //console.log("MUTATION - 1")
//   if (document.querySelector("video")) {
//     //console.log("MUTATION - found a video")
//     chrome.runtime.sendMessage({
//       showIcon: true,
//     });
//     //console.log("MUTATION ----------- Found video, sending ")
//     //console.log(mutationList)
//     //console.log(observer)
//     observer.disconnect();
//   }
// });
// const config = { attributes: true, childList: true, subtree: true };
// observer.observe(document, config);





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

window.mouseAndVid = {}
window.mouseAndVid.crazyIframeBug = 0;
let crazyIframeBug = 0
// iframe stuff and pop up stuff
window.addEventListener( "message", (e) => {
  window.mouseAndVid.crazyIframeBug += 1;
  crazyIframeBug += 1;
  if (window.mouseAndVid.crazyIframeBug > 15 || crazyIframeBug > 15) {
    ////console.log("window.mouseAndVid.crazyIframeBug", window.mouseAndVid.crazyIframeBug)
    ////console.log("crazyIframeBug", crazyIframeBug)
    return;
  }

  ////console.log('recieved some message e.data', e)
  if (e.data.mv_topIframe) {
    // Tell the top window which iframe to move
    window.top.postMessage({ mv_iframeSrc: window.location.href }, "*");
  }

  if (window.location === window.parent.location) {
    if (e.data.mv_iframeSrc) {
      ////console.log("gonna pop up!")
      document.mv_popup_element = document.querySelector(`iframe[src="${e.data.mv_iframeSrc}"`);
      document.documentElement.style.overflow = "hidden";
      
      if (mvObject.popoutSetting != "fullscreen") {
        document.mv_popup_element.classList.add("popup_style");
        chrome.runtime.sendMessage({
          popup: true,
          acao: "criar", // action: create
        });
      }
      if (mvObject.popoutSetting == "fullscreen") {
        ////console.log('adding fullscreen')
        document.mv_popup_element.classList.add("fullscreenIframe_style");
      }
      
    } else if (e.data.mv_closePopup) {
      document.mv_popup_element.classList.remove("popup_style");
      document.mv_popup_element.classList.remove("fullscreenIframe_style");
      document.documentElement.style.overflow = "revert";
      if (mvObject.popoutSetting != "fullscreen") {
        chrome.runtime.sendMessage({
          popup: true,
          acao: "fechar", // action: close
          activatePopupTab: e.data.activatePopupTab,
        });
      }
    }
  }
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* Receive messages from background script */
/* Kicks off javascript to run the usefull stuff of this extension's purpose */
chrome.runtime.onMessage.addListener(function (message) {
  ////console.log("Content Script - MSG FROM BACKGROUND -", message)
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
  ////console.log("Scripts - options", options)
  mvObject = {
    left:       options.left          || 5,
    middle:     options.middle        || 10,
    right:      options.right         || 15,
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
    }
    // popupTabOrFullscreen: () => {
    //   chrome.runtime.sendMessage({
    //     popoutSetting: options.popoutSetting
    //   })
    // }
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
  ////console.log("Updating script values...")
  ////console.log("changes", changes)
  // //console.log("changes[Object.keys(changes)[0]] ", changes[Object.keys(changes)[0]] )
  mvObject[Object.keys(changes)[0]] = changes[Object.keys(changes)[0]].newValue;
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
// convert img with src to svg
// https://dev.to/luisaugusto/how-to-convert-image-tags-with-svg-files-into-inline-svg-tags-3jfl
function convertImages(myIconsDict, callback) {

  for (const key in myIconsDict) {
    let image = myIconsDict[key]
    ////console.log(image);
    ////console.log(image.src);
    fetch(image.src)
    .then(res => res.text() )
    .then(data => {
      // debugger;
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
  iconWrapper.id= "mouse-vid-icon-wrapper"

  let seek_ff = document.createElement("img");
  let seek_rewind = document.createElement("img");
  let vol_decrease = document.createElement("img");
  let vol_increase = document.createElement("img");
  let vol_mute = document.createElement("img");
  let vol_sound = document.createElement("img");
  let play_speed = document.createElement("img");

  seek_ff.src = chrome.runtime.getURL("../icons/seek_ff.svg")
  seek_rewind.src = chrome.runtime.getURL("../icons/seek_rewind.svg")
  vol_decrease.src = chrome.runtime.getURL("../icons/vol_decrease.svg")
  vol_increase.src = chrome.runtime.getURL("../icons/vol_increase.svg")
  vol_mute.src = chrome.runtime.getURL("../icons/vol_mute.svg")
  vol_sound.src = chrome.runtime.getURL("../icons/vol_sound.svg")
  play_speed.src = chrome.runtime.getURL("../icons/play_speed.svg")

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
    #mouse-vid-icon-wrapper {
      position: absolute;
      z-index: 30000;
    }

    #mouse-vid-icon-wrapper svg,
    #mouse-vid-icon-wrapper img,
    #mouse-vid-icon-wrapper span {
      position: absolute;
      height: 14px;
      width: 14px;
      height: 16px;
      width: 16px;
      pointer-events: none; 
      opacity: 0;
      filter: drop-shadow(2px 3px 2px rgb(0 0 0 / 0.6));
    }    
    #mouse-vid-icon-wrapper span {
      color: white;
      left: calc(18px + 6px);
      font-size: 14px;
      white-space: nowrap;
    }
    #mouse-vid-icon-wrapper svg path {
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
    #mouse-vid-icon-wrapper .disp-block {
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
  const getAllSiblings = (ele) => {
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
  for ( let ele of allWrappingEles) {
    if (vid.getBoundingClientRect().width == ele.getBoundingClientRect().width  
      && vid.getBoundingClientRect().height == ele.getBoundingClientRect().height
      && vid.offsetLeft == ele.offsetLeft
      && vid.offsetHeight == ele.offsetHeight)  {
        ////console.log(" ✔✔✔✔✔ Adding candidate")
        ele.videoReference = vid
    } else {
      ////console.log(" X X X X NOT adding candidate")
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
  //console.log("Setting up Element with video ....... start 1 ")
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
  ////console.log("Setting up Element with video ....... complete 2")
  wheel(e, vid);
}

// When we scroll the wheel an event is fired from the cursor position. We check if the cursor is ontop of a video.
// Sometimes elements are wrapping the video such that the event (specifically, event.target) won't 'see' the <video>
// element and instead see the wrapper.
function getVidIfPresent(e) {
  //console.log("SHORTCUT FINDER!")

  // if (!document.mv_pause_function && !e.target.mv_on && !e.target.isNotAVideoWrapper) {
  if (!document.mv_pause_function && !e.target.isNotAVideoWrapper) {
    if (e.target.tagName == "VIDEO") {
      //console.log("SHORTCUT FINDER - vidElement")
      return { "type": "videoElement"}
    }
    if (e.target.videoReference) {
      //console.log("SHORTCUT FINDER - videoReference")
      return { "type": "videoReference" }      
    }
    
    for (const vid of document.querySelectorAll("video")) {
      if (vid.clientWidth < minVideoWidth) {
        //console.log(".....video too small")
        continue
      }
      
      if (
        e.clientY >= vid.getBoundingClientRect().y 
        && e.clientY <= vid.getBoundingClientRect().y + vid.clientHeight 
        && e.clientX >= vid.getBoundingClientRect().x 
        && e.clientX <= vid.getBoundingClientRect().x + vid.clientWidth 
      ) {
        //console.log("SHORTCUT FINDER - longsearch")
        return { "type": "longSearch", "vid": vid  }
      }
    }
    e.target.isNotAVideoWrapper = true; // prevents unneccessary running code. ... a little
    //console.log("SHORTCUT FINDER - nothing")
  }
}




// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
function run() {
  //console.log("!!!!!! IN RUN !!!!!!")
  getAllWrapingElesAux() 
  setupStyles()
  setupIcons()
  // window.addEventListener('wheel', () => {} , { passive: false }) 
  window.addEventListener('wheel', main,{ passive: false });
  window.addEventListener('mousedown', muteMiddleClick)
  auxMiddleMouseClick()
  // document.querySelector('video').addEventListener('mousedown', () => //console.log("you clicked 123"))
  // window.addEventListener('click', () => //console.log("you clicked"), false)
  // document.querySelector('video').addEventListener('click', () => //console.log("you clicked"))
  // document.querySelector('video').addEventListener('onmouseup', () => //console.log("you onmouse up"))
  // document.querySelector('video').addEventListener('onmousedown', () => //console.log("you onmouse down"))
  


  function main(e) {
    /* document.mv_pause_main is useful when transitioning to the popup. Otherwise document.mv_popup_element will change when scrolling too fast */
    //console.log("-------> MAIN! aka document.WHEEL!< -----------")
        
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
      }, 500) 

    }
    
    // This section could be better (A)
    let shortcut = getVidIfPresent(e)
    let vid = null
    if ( shortcut == null ) {
      //console.log("Script - VIDEO NULL - nothing ")
      return
    }    
    if ( shortcut.type == "videoElement" ) {
      vid = e.target
      //console.log("Script - VIDEO - Found video refrence - fast 1")
    }
    if ( shortcut.type == "videoReference" ) {
      vid = e.target.videoReference
      //console.log("Script - VIDEOREFERENCE - Found video refrence - fast 2")
    }
    if ( shortcut.type == "longSearch") {
      vid = shortcut.vid
      //console.log("Script - Found for video refrence - slow 2")
    }
    if ( vid != null) {
      preventStrangeScroll()
      setUpElementWithVideo(e, vid)
    }

  }


  function auxMiddleMouseClick() {
    //console.log("aux middle mouse")
    document.querySelectorAll('video').forEach( vid => {
      //console.log("found video", vid)
      //console.log("found video parent", vid.parentElement)

      function wrap(el, wrapper) {
        //console.log("wrap=========================")
        el.parentNode.insertBefore(wrapper, el);
        wrapper.appendChild(el);
      }
      let div = document.createElement('div')
      // let vid = document.querySelector('video')
      wrap(vid, div)


      // div.style.position = "relative"
      // div.style.width = "100%"
      // div.style.height = "100%"
      // vid.parentElement.appendChild(div)
      // //console.log(vid.outerHTML)
      // div.innerHTML = vid.outerHTML
      // vid.remove()
      // div.addEventListener('mousedown', (e) => { //console.log('e', e); e.preventDefault(), true })
      div.addEventListener('mousedown', (e) => { muteMiddleClick(e), true })
      // vid.parentElement.addEventListener('mousedown', (e) => { muteMiddleClick(e), true })
    })
  }
  function muteMiddleClick(e) {
    // If we already computed it, or not a middle mouse click, or if element is too small
    //console.log("is middle mouse", e.button == 1 )
    if ( e.target.mute_on || e.button != 1 || e.target.clientWidth < minVideoWidth ) {
      return
    }

    let shortcut = getVidIfPresent(e) 
    let vid = null
    if ( shortcut == null ) {
      //console.log("Script - MUTE NULL - nothing ")
      return
    }    

    // This section could be better (B)
    if ( shortcut.type == "videoElement" ) {
      //console.log("Script - MUTE NULL - videoElement ")
      vid = e.target
    }
    if ( shortcut.type == "videoReference" ) {
      //console.log("Script - MUTE NULL - videoReference ")
      vid = e.target.videoReference
    }
    if ( shortcut.type == "longSearch") {
      //console.log("Script - MUTE NULL - longSearch ")
      vid = shortcut.vid
    }
    if (vid != null) {
      //console.log("Script - MUTE DOING SOMETHING - GOGOG ")
      e.preventDefault()
      e.target.mute_on = true;
      e.target.addEventListener('mousedown', (e) => { doMute(e, vid) })
      doMute(e, vid)
    }
  }
}
























function wheel(e, vid) {
  if (document.mv_pause_function) {
    //console.log("WHEELPAUSE FUNCTION")
    return
  }  
  //console.log("WHEEL EVENT")
  e.preventDefault();
  e.stopPropagation();

  const cX = e.clientX - Math.round(vid.getBoundingClientRect().x);
  const delta = e.deltaY;

  if (e.shiftKey) {
    setBrightness(delta, vid);
    return
  } 

  //console.log("MODE: ", mvObject.mode)

  // Change time position
  if (mvObject.mode === "mode_seek_middle") {          
    //console.log("-------> SKIP 1")
    vid.currentTime += getIncrement(delta, mvObject.middle);

  // Skip only
  } else if (mvObject.mode === "mode_seek_only") {          
    //console.log("-------> SKIP 2")
    seekVideoByAreas(cX, delta, vid);

  // Volume only
  } else if (mvObject.mode === "mode_volume") {
    //console.log("-------> VOLUME")
    changeVolume(delta, vid);

  // Default to Everything mode (volume, seek)
  } else { // mvObject.mode ===  mode_everything

    // bottom half
    if (e.offsetY <= vid.clientHeight / 2) {
      if (cX < vid.clientWidth - (90 / 100) * vid.clientWidth) {        
        //console.log("-------> POP-UP/FULLSCREEN")
        controlPopoutEvent({delta, vid, e})

      } else if (cX > vid.clientWidth - (10 / 100) * vid.clientWidth) {  
        //console.log("-------> SPEED")
        changePlaybackRate(delta, vid);
      } else {  
        //console.log("-------> VOLUME 2")
        changeVolume(delta, vid);
      }

    // top half
    } 
    else { 
      //console.log("-------> SKIP 3")
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
// HERE
// Rewind, fast forward, volume up, volume down, and mute all below in next few methods
function displayIcon(iconName, msg, video) {

  let span = document.createElement("span")
  span.innerText = msg
  // put the element on the screen, then give a fade away styling
  let iconWrapper = document.getElementById("mouse-vid-icon-wrapper")  
  iconWrapper.innerHTML = iconsDict[iconName].outerHTML + span.outerHTML
  iconWrapper.classList.remove("fade-icon-out")
  iconWrapper.classList.add("fade-icon-out")

  // Place icon in top left of video
  let scrollLeft = window.pageXOffset || video.scrollLeft
  let scrollTop = window.pageYOffset || video.scrollTop
  let vidTop  = video.getClientRects()[0].top + scrollTop
  let vidLeft = video.getClientRects()[0].left + scrollLeft
  let middlePx = video.getClientRects()[0].width /2
  iconWrapper.style.top = vidTop + 'px'
  iconWrapper.style.left = (vidLeft + middlePx - 32)  +'px'
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
  //console.log("Script - VOLUME - volume change")
  if (video.muted) {
    video.muted = false;
  }
  // HERE 
  if (delta < 0) {
    let msg = (video.volume + mvObject.volumeRate * 0.01)
    msg = msg >= 1 ? "1.00" : msg.toFixed(2)
    displayIcon("vol_increase", msg, video)
  } else { 
    let msg = (video.volume - mvObject.volumeRate * 0.01)
    msg = msg <= 0 ? "0.00" : msg.toFixed(2)
    displayIcon("vol_decrease", msg, video)
  }

  mvObject.volume = video.volume;
  let deltaVolume = delta < 0 ? 1 * (0.01 * mvObject.volumeRate) : -1 * (0.01 * mvObject.volumeRate);
  //console.log("deltaVolume", deltaVolume )
  //console.log(" mvObject.volume",  mvObject.volume )
  if (delta < 0  && deltaVolume + mvObject.volume >= 1 ) {
    //console.log(" SHAZAM 1" )
    mvObject.volume = 1;
  } 
  else if (delta > 0  && deltaVolume + mvObject.volume <= 0 ) {
    //console.log(" SHAZAM 2" )
    mvObject.volume = 0;
  } 
  else {
    //console.log(" SHAZAM 3" )
    mvObject.volume = mvObject.volume +   1 * (delta < 0 ? 1 * (0.01 * mvObject.volumeRate) : -1 * (0.01 * mvObject.volumeRate));
  }
  
  //console.log("1 --------------> ", mvObject.volume)
  video.volume = parseFloat( Math.min(Math.max(mvObject.volume, 0), 1).toFixed(2) );
  //console.log("2 --------------> ", video.volume)
  //console.log("2.1 --------------> ", video.muted)
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



const getIncrement = (delta, rate) => {
  return 1 * (delta < 0 ? 1 * rate : -1 * rate);
}

function seekVideoByAreas(cX, delta, video) {
  let seekTo = video.currentTime;
  let rate;
  const neet2Digits = (num) => { 
    return num < 10 ? "0" + num : num
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
    let seekTo2 =  Math.floor(seekTo)
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








//  pop up stuff below
function close_popup(activatePopupTab) {
  //console.log("===============> CLOSING POP UP")
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
  //console.log("IN OPEN POPUP")
  if (document.mv_playing_on_popup) {
    //console.log("open_popup - going to clsoe it 1")
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
    if (window.location !== window.parent.location ) {
    // if (window.location !== window.parent.location && !isFullscreen) {
      // The page is in an iframe
      //console.log("sending postMessage for ifram")
      getTopIframe(window).postMessage({ mv_topIframe: true }, "*");
    } else {
      //console.log("open_popup - Sending message to background script")
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
  //console.log("1 @@@@@@@ start controlPopoutEvent")

  let {delta, vid, e} = data

  if (mvObject.popoutSetting == "pip"){
    //console.log("controlPopoutEvent - GOING IN POP UP")
    activatePopupFeature(delta, vid, e)
  }
  if (mvObject.popoutSetting == "fullscreen"){
    //console.log("controlPopoutEvent - GOING IN FUUULSCREEn")
    activateFullScreen()
  }
  if (mvObject.popoutSetting == "disabled"){
    // do nothing
  }
  //console.log("2 @@@@@@ end controlPopoutEvent")
}


function activateFullScreen() {
  open_popup(true);
}

function activatePopupFeature(delta, vid, e) {
  if (delta > 0) {
    // Close popup and stay on the current tab
    if (document.mv_playing_on_popup) {
      //console.log("open +1")
      close_popup(false);
    } else {
      // The popup must open only when the video is not in fullscreen mode.
      if (document.fullscreenElement) {
        //console.log("open +2")
        document.exitFullscreen();

        // We need this so that when the user scrolls out of fullscreen the popup doesn't open up unwantedly
        document.mv_pause_function = true;
        setTimeout(() => { document.mv_pause_function = false;}, 500);
      } else {
        //console.log("open +3")
        open_popup();
      }
    }
  } else if (delta < 0) {
    //console.log(" activatePopupFeature- !!!")
    // Close popup and move to the tab playing the video
    if (document.mv_playing_on_popup) {
      //console.log("close -1")
      close_popup(false);
    
    } else {
      if (document.fullscreenElement == null) {
        (function (x) {
          setTimeout(function () {
            if (document.fullscreenElement == null) {
              //console.log("close -2")
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
                
              //console.log("close -2.1", attribs)
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