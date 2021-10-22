// Check if there is video on the page. If there is, send a message to the
// background script to show the extension's icon and activate it.


console.log('++++--- EXTENSION LOADED EVENT  --- ') // run_at manifest deafult - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_scripts
// main2()


const observer = new MutationObserver(function (mutationList, observer) {
  if (document.querySelector("video")) {
    chrome.runtime.sendMessage({
      showIcon: true,
    });
    console.log("MUTATION ----------- Found video, sending ")
    console.log(mutationList)
    console.log(observer)
    observer.disconnect();
  }
});
// const config = { attributes: true, childList: true, subtree: true };
const config = { attributes: false, childList: true, subtree: true };
observer.observe(document, config);


window.addEventListener(
  "message",
  (e) => {
    // console.log('recieved some message e', e)
    // console.log('recieved some message e.data', e.data)
    if (e.data.mv_topIframe) {
      // Tell the top window which iframe to move
      window.top.postMessage({ mv_iframeSrc: window.location.href }, "*");
    }

    if (window.location === window.parent.location) {
      if (e.data.mv_iframeSrc) {
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
  },
  false
);
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/* Receive messages from background script */
chrome.runtime.onMessage.addListener(function (message) {
  console.log("(message) found: ", message)
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
  mvObject = {
    left:       options.left          || 5,
    middle:     options.middle        || 2,
    right:      options.right         || 10,
    mode:       options.mode          || "mode_everything",
    // pip:        options.pip           || true,
    // newTab:     options.newTab        || false, // does nothing
    volumeRate: options.volumeRate    || 6,
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
  };
});


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //

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
  console.log("something happend")
  console.log("changes", changes)
  console.log("Object.keys(changes)", Object.keys(changes))
  console.log("changes[Object.keys(changes)[0]] ", changes[Object.keys(changes)[0]] )
  mvObject[Object.keys(changes)[0]] = changes[Object.keys(changes)[0]].newValue;
});

















document.addEventListener('click', event => {
  console.log("Click", event)
  console.log("Click detail:" + event.detail)
  console.log("Click target:" + event.target)
  console.log(event.target)
  console.log("Click offsetleft:" + event.target.offsetLeft)
  console.log("Click offsetHeight:" + event.target.offsetHeight)
  console.log("Click button:" + event.button)
  // vidz[0].parentElement.querySelectorAll("video")
});

function getAllSiblings(ele) {
  console.log("================>IN EHREEEEEEE")
  let siblings = [ele]
  let tempEle = ele
  
  while (tempEle.previousSibling) {
    siblings.push(tempEle.previousSibling)
    tempEle = tempEle.previousSibling
  }
  tempEle = ele
  while (tempEle.nextSibling) {
    siblings.push(tempEle.nextSibling)
    tempEle = tempEle.nextSibling
  }
  return siblings
}


function getPotentialVidsWrapperParent(vid, ancestor) {
  console.log("bam! ancestor")
  console.log(ancestor)
  if (vid.clientWidth < 250) {
    console.log("video too small")
    // e.target.mv_on = true;
    return false
  }
  console.log("================ > IN")
  let allWrappingEles = getAllSiblings(ancestor)
  console.log("================ > OUT")
  console.log(allWrappingEles)
  console.log("vvvvvvvvvvvvvvvvvvvvvvvvvvvv")
  console.log("vid.width=" + vid.getBoundingClientRect().width )
  console.log("vid.height="+ vid.getBoundingClientRect().height)  
  console.log("vid.offsetLeft=" + vid.offsetLeft )
  console.log("vid.offsetHeight="+ vid.offsetHeight )  
  console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
  for ( let ele of allWrappingEles) {
    console.log(ele)
    console.log("ele.width=" + ele.getBoundingClientRect().width )
    console.log("ele.height="+ ele.getBoundingClientRect().height)  
    console.log("ele.offsetLeft=" + ele.offsetLeft )
    console.log("ele.offsetHeight="+ ele.offsetHeight )  
    if (vid.getBoundingClientRect().width == ele.getBoundingClientRect().width  
      && vid.getBoundingClientRect().height == ele.getBoundingClientRect().height
      && vid.offsetLeft == ele.offsetLeft
      && vid.offsetHeight == ele.offsetHeight)  {
        ancestor.candidates ? ancestor.candidates.push(vid) :  ancestor.candidates = [vid]
        ele.videoReference = vid
        console.log(" ✔✔✔✔✔ Adding candidate")
        console.log(ancestor.candidates)
    } else {
      console.log(" X X X X NOT adding candidate")
    }
  }
  console.log("-----------------------------------------------ele.candidates")
  console.log(ancestor.candidates)


}

function getShit() {
  console.log("Getting shit")
  let i = 0;
  // .previousSibling
  // .previousSibling
  // .previousSibling
  // .previousSibling
  for (const vid of document.querySelectorAll("video")) {
    console.log("---- ", i, " ----")
    console.log("vid: ", vid)
    let isPotential = getPotentialVidsWrapperParent(vid, vid.parentElement )
    i++
  }
}


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
function run() {
  console.log("!!! IN RUN !!!")
  console.log('--- XX2XX2 run --- ')
  getShit() 
  console.log("DONE")
  document.onwheel = main; 
  function main(e) {
    /* document.mv_pause_main is useful when transitioning to the popup.
    Otherwise document.mv_popup_element will change when scrolling too fast */
    console.log("-------> MAIN! aka document.WHEEL!< -----------")
    console.log(e)
    console.log(e.target)
    console.log(e.target.videoReference)
    // HERE
    if (e.videoReference) {

    }
    console.log("mv_pasue" ,document.mv_pause_function)  
    console.log("target.mv_on" , e.target.mv_on)  
    if (!document.mv_pause_function && !e.target.mv_on) {
      console.log("HERE WE GOOOOOOOOOOOOOO")
      for (const vid of document.querySelectorAll("video")) {
        if (vid.clientWidth < 250) {
          console.log("video too small")
          // e.target.mv_on = true;
          continue
        }
        console.log("Found vid: title: ", vid.title , " - src: ", vid.src, " - id: ", vid.id)
        console.log("Found vid: vid.getBoundingClientRect x,y: ", vid.getBoundingClientRect().x , vid.getBoundingClientRect().y)
        console.log("Found vid: vid.clientHeight, clientWidth: ", vid.clientHeight ,  vid.clientWidth)
        console.log("Found vid: e.clientX, e.clientY ", e.clientX ,  e.clientY)
        console.log("Found vid: -------> candidate ", e.target.candidates)
        for ( let ele of e.target.candidates) {
            if (e.target == ele) {
              console.log("....... BAM FOUND!")
              console.log(e.target)
              console.log(ele)
            } else {
              console.log("...... NOTHING")
              console.log(e.target)
              console.log(ele)

            }
        }
        if (
          // !vid.paused &&
          e.clientY >= vid.getBoundingClientRect().y 
          && e.clientY <= vid.getBoundingClientRect().y + vid.clientHeight 
          && e.clientX >= vid.getBoundingClientRect().x 
          && e.clientX <= vid.getBoundingClientRect().x + vid.clientWidth 
          // && (e.target.clientHeight === vid.clientHeight || e.target.clientWidth === vid.clientWidth)
        ) {
          console.log("In the big IF statment")
          e.preventDefault();
          console.log("e")
          console.log(e.target)
          console.log(e.onwheel)

          document.mv_popup_element = vid;

          /* ********* Popup info START ********* */
          /* This will be used to know where to place the element when the popup closes. 'hasPlaceholder' is used so that a new 'div' won't be created when the video is in the popup. */
          if (!vid.hasPlaceholder) {
            vid.hasPlaceholder = true;
            document.mv_placeholder = document.createElement("div");
            document.mv_popup_element.parentNode.insertBefore(
              document.mv_placeholder,
              document.mv_popup_element
            );
          }
          /* ********* Popup info END ********* */

          /* This is a flag to skip this video because we already atached the wheel function to it */
          // document.mouse_wheel_vids = document.mouse_wheel_vids ? [vid]
          // e.target.videoReference = vid
          
          e.target.mv_on = true;
          console.log("going into wheel 1")
          console.log(e)
          console.log(e.target)
          console.log(e.target.onwheel)
          e.target.onwheel = (e) => wheel(e, vid);
          document.pvwm = e.target;
          break;
        }
      }
    }
  }
   
}

































// function addCoolVideoEvents(vid) {
//   vid.addEventListener("wheel", e => {
//     console.log("WHEEEEEEEEEEEEEL")
//     console.log(e)
//     wheel(e, vid)
//   })
// }
  
// function main2() {
//   /* document.mv_pause_main is useful when transitioning to the popup.
//   Otherwise document.mv_popup_element will change when scrolling too fast */
//   console.log('main2')
//   console.log("querying for vids")
//   console.log(document.querySelectorAll("video"))

//   document.addEventListener("mouseover", e => {
//       // console.log("hovered e.target", e.target)
//       console.log("hovered e.target.tageName", e.target.tagName, " - ", e.target.tagName=="VIDEO")
//       // console.log("hovered e.target", e.target)
//       console.log("hovered e.target", e.target.querySelectorAll("video"))
//       if (e.target.tagName.toLowerCase() == "video") {
//         console.log("--> THIS IS A VIDEO ")
//         console.log("--> e.target.isMVAdded ", e.target.isMVAdded)
//         if (e.target.tagName.isMVAdded) {
//           console.log("--> it has it")
//         } 
//         else if (!e.target.tagName.isMVAdded) {
//           console.log("adding DANK e lsitersner")
//           addCoolVideoEvents(e.target)
//         }
//       }
//   }, true);
//     for (const vid of document.querySelectorAll("video")) {
//       console.log("found vid", vid)
//       console.log("found clientWidth", vid.clientWidth)
//       console.log("found scrollWidth", vid.scrollWidth)
//       console.log("found offsetWidth", vid.offsetWidth)
//       console.log("found videoWidth", vid.videoWidth)
//       // if (vid.clientWidth < 250) {
//       if (vid.scrollWidth < 250) {
//         console.log("video too small")
//         console.log("video too small,", vid)
//         vid.isMVAdded = true;
//         return
//       }
//       if (vid.isMVAdded == true) {
//         console.log("retnring")
//         return
//       }
//       console.log("should be adding evetne listners")
//       vid.addEventListener("wheel", e => {
//         console.log("WHEEEEEEEEEEEEEL")
//         wheel(e, vid)
//       });
//       // vid.addEventListener("mouseover", e => {
//       //   console.log("hovered e.target", e.target)
//       // });
      
      
//       console.log(" @ NEW - vid: title: ", vid.title , " - src: ", vid.src, " - id: ", vid.id)
//       console.log(" @ NEW -  vid: vid.().x: ", vid.getBoundingClientRect().x , " - vid.().y: ", vid.getBoundingClientRect().y)
//       console.log(" @ NEW -  vid: vid.height: ", vid.clientHeight , " - vid.weidth: ", vid.clientWidth)

//       document.mv_popup_element = vid;
//       // document.pvwm = vid; HERE wtf this does nothing
//       vid.isMVAdded = true;

//       /* This will be used to know where to place the element when the popup closes. 'hasPlaceholder' is used so that a new 'div' won't be created when the video is in the popup. */
//       if (!vid.hasPlaceholder) {
//         vid.hasPlaceholder = true;
//         document.mv_placeholder = document.createElement("div");
//         document.mv_popup_element.parentNode.insertBefore(document.mv_placeholder, document.mv_popup_element);
//       }
//   }
// }

function wheel(e, vid) {
  if (!document.mv_pause_function) {
    console.log("WHEEL EVENT")
    console.log(e)
    console.log(e.target)
    e.preventDefault();
    // console.log(e.clientX )
    // console.log(Math.round(vid.getBoundingClientRect().x ))

    const cX = e.clientX - Math.round(vid.getBoundingClientRect().x);
    const delta = e.deltaY;
    // console.log("CX & delta", cx, delta)

    if (e.shiftKey) {
      setBrightness(delta, vid);
      return
    } 

    console.log("MODE: ", mvObject.mode)

    // Change time position
    if (mvObject.mode === "mode_seek_middle") {          
      vid.currentTime += getIncrement(delta, mvObject.middle);

    // Skip only
    } else if (mvObject.mode === "mode_seek_only") {          
      seekVideoByAreas(cX, delta, vid);

    // Volume only
    } else if (mvObject.mode === "mode_volume") {
      changeVolume(delta, vid);

    // Everything 
    } else { // mvObject.mode ===  mode_everything

      // bottom half
      if (e.offsetY <= vid.clientHeight / 2) {
        if (cX < vid.clientWidth - (90 / 100) * vid.clientWidth) {
          controlPopoutEvent({delta, vid, e});
          // activateFullScreenPopupFeature(delta, vid, e);

        } else if (cX > vid.clientWidth - (10 / 100) * vid.clientWidth) {
          changePlaybackRate(delta, vid);
        } else {
          changeVolume(delta, vid);
        }

      // top half
      } 
      else { 
        seekVideoByAreas(cX, delta, vid);
      }
    }
  }
  
}



function changeVolume(delta, video) {
  if (video.muted) {
    video.muted = false;
    video.volume = 0;
  }
  
  mvObject.volume = video.volume;
  let deltaVolume = delta < 0 ? 1 * (0.01 * mvObject.volumeRate) : -1 * (0.01 * mvObject.volumeRate);

  if (delta < 0  && deltaVolume + mvObject.volume >= 1 ) {
    mvObject.volume = 1;
  } 
  else if (delta > 0  && deltaVolume + mvObject.volume <= 0 ) {
    mvObject.volume = 0;
  } else {
    mvObject.volume += 1 * (delta < 0 ? 1 * (0.01 * mvObject.volumeRate) : -1 * (0.01 * mvObject.volumeRate));
  }
  // console.log("VOL - mvObject.volume=", mvObject.volume)
  console.log("VOL - parseFloat( Math.min(Math.max(mvObject.volume, 0), 1).toFixed(2))=",parseFloat( Math.min(Math.max(mvObject.volume, 0), 1).toFixed(2)) )
  // mvObject.volume += 1 * (delta < 0 ? 1 * (0.01 * mvObject.volumeRate) : -1 * (0.01 * mvObject.volumeRate));
  video.volume = parseFloat( Math.min(Math.max(mvObject.volume, 0), 1).toFixed(2) );
}

let firstMov;
function changePlaybackRate(delta, video) {
  firstMov = delta;
  setTimeout(
    function (mov) {
      if (firstMov !== mov) {
        video.playbackRate = video.defaultPlaybackRate;
      }
    },
    150,
    firstMov
  );
  video.playbackRate += 1 * (delta < 0 ? 1 * 0.25 : -1 * 0.25);
  video.playbackRate = parseFloat( Math.min(Math.max(video.playbackRate, 0.25), 4).toFixed(2) );
}

let seekTo;
function seekVideoByAreas(cX, delta, video) {
  seekTo = video.currentTime;
  if (cX <= video.clientWidth / 3) {
    seekTo += getIncrement(delta, mvObject.left);
  } else if ( cX > video.clientWidth / 3 && cX <= (video.clientWidth / 3) * 2 ) {
    seekTo += getIncrement(delta, mvObject.middle);
  } else {
    seekTo += getIncrement(delta, mvObject.right);
  }
  if (isNetflix) {
    document.dispatchEvent(
      new CustomEvent("mvNetflixSeek", { detail: parseInt(seekTo) * 1000 })
    ); // milliseconds
  } else {
    video.currentTime = seekTo;
  }
}

function getIncrement(delta, mArea) {
  return 1 * (delta < 0 ? 1 * mArea : -1 * mArea);
}



















// Junk
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Shitty pop up
// Shitty pop up
// Shitty pop up
// Shitty pop up
// Shitty pop up
// Shitty pop up
// Shitty pop up
// Shitty pop up
// Shitty pop up
// Shitty pop up
// Shitty pop up
// Shitty pop up
function close_popup(activatePopupTab) {

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

  // Remove play/pause onclick event
  document.mv_popup_element.onclick = null;

  document.mv_popup_element.classList.remove("popup_style");

  // Place video back in original position
  document.mv_placeholder.insertAdjacentElement(
    "afterend",
    document.mv_popup_element
  );

  // Add delay to prevent fullscreen from happening when closing the popup
  setTimeout(() => {
    document.mv_popup_element.scrollIntoView();
    document.mv_pause_function = false;
  }, 500);
}

function open_popup() {
  if (!document.mv_playing_on_popup) {
    document.mv_playing_on_popup = true;

    // Pause execution of the wheel function while transitioning to popup
    document.mv_pause_function = true;

    // Hide scrollbar
    document.documentElement.style.overflow = "hidden";

    document.mv_popup_element.className += " popup_style";

    document.body.insertBefore(
      document.mv_popup_element,
      document.body.firstChild
    );

    // Add an event listener to play/pause video when clicking on it
    document.mv_popup_element.onclick = () => {
      if (!document.mv_popup_element.paused) {
        document.mv_popup_element.pause();
      } else {
        document.mv_popup_element.play();
      }
    };

    setTimeout(() => {
      document.mv_pause_function = false;
    }, 500);

    // Check if video is inside an iframe
    if (window.location !== window.parent.location) {
      // The page is in an iframe
      getTopIframe(window).postMessage({ mv_topIframe: true }, "*");
    } else {
      mvObject.popup("criar");
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

function controlPopoutEvent(data) {
  let d2 = { ... data }
  let {delta, vid, e} = data
  console.log("delta, vid, e and data:")
  console.log(delta)
  console.log(vid)
  console.log(e)
  console.log(data)
  console.log("mvObject.popoutseting")
  console.log(mvObject.popoutSetting)
  console.log("mvObject")
  console.log(mvObject)
  if (mvObject.popoutSetting == "pip"){
    activatePopupFeature(delta, vid, e)
  }
  if (mvObject.popoutSetting == "newTab"){
    activateNewTab(delta, vid, e)
  }
  if (mvObject.popoutSetting == "fullscreen"){
    activateFullScreen(delta, vid, e)
  }
  if (mvObject.popoutSetting == "disabled"){
    // do nothing
  }
}

function activateNewTab(delta, vid, e) {

}

function activateFullScreen(delta, vid, e) {
  if (delta > 0) {
    open_popup();
  } else if (delta < 0) {
    close_popup(true);
  }
}

function activatePopupFeature(delta, vid, e) {
  if (delta > 0) {
    // Close popup and stay on the current tab
    if (document.mv_playing_on_popup) {
      close_popup(false);
    } else {
      // The popup must open only when the video is not in fullscreen mode.
      if (document.fullscreenElement) {
        document.exitFullscreen();

        // We need this so that when the user scrolls out of fullscreen
        // the popup doesn't open up unwantedly
        document.mv_pause_function = true;
        setTimeout(() => {
          document.mv_pause_function = false;
        }, 500);
      } else {
        open_popup();
      }
    }
  } else if (delta < 0) {
    // Close popup and move to the tab playing the video
    if (document.mv_playing_on_popup) {
      close_popup(true);
    } else {
      if (document.fullscreenElement == null) {
        (function (x) {
          setTimeout(function () {
            if (document.fullscreenElement == null) {
              const attribs = [
                ...document
                  .elementsFromPoint(e.x, e.y)
                  .filter(
                    (el) =>
                      (el.contains(vid) &&
                        el.clientWidth === e.target.clientWidth) ||
                      el.clientHeight === e.target.clientHeight
                  )
                  .pop()
                  .querySelectorAll("*"),
              ]
                .map((node) => [...node.attributes])
                .reduce((acc, cur) => acc.concat(cur), [])
                .filter(
                  (attrib) =>
                    attrib.nodeValue
                      .toLowerCase()
                      .replace(" ", "")
                      .indexOf("fullscreen") >= 0
                )
                .filter(
                  (attrib) =>
                    attrib.ownerElement.clientWidth !== x.clientWidth &&
                    attrib.ownerElement.clientHeight !== x.clientHeight
                );
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

function activateFullScreenPopupFeature(delta, vid, e) {
  if (delta > 0) {
    // Close popup and stay on the current tab
    if (document.mv_playing_on_popup) {
      close_popup(false);
    } else {
      // The popup must open only when the video is not in fullscreen mode.
      if (document.fullscreenElement) {
        document.exitFullscreen();

        // We need this so that when the user scrolls out of fullscreen
        // the popup doesn't open up unwantedly
        document.mv_pause_function = true;
        setTimeout(() => {
          document.mv_pause_function = false;
        }, 500);
      } else {
        open_popup();
      }
    }
  } else if (delta < 0) {
    // Close popup and move to the tab playing the video
    if (document.mv_playing_on_popup) {
      close_popup(true);
    } else {
      if (document.fullscreenElement == null) {
        (function (x) {
          setTimeout(function () {
            if (document.fullscreenElement == null) {
              const attribs = [
                ...document
                  .elementsFromPoint(e.x, e.y)
                  .filter(
                    (el) =>
                      (el.contains(vid) &&
                        el.clientWidth === e.target.clientWidth) ||
                      el.clientHeight === e.target.clientHeight
                  )
                  .pop()
                  .querySelectorAll("*"),
              ]
                .map((node) => [...node.attributes])
                .reduce((acc, cur) => acc.concat(cur), [])
                .filter(
                  (attrib) =>
                    attrib.nodeValue
                      .toLowerCase()
                      .replace(" ", "")
                      .indexOf("fullscreen") >= 0
                )
                .filter(
                  (attrib) =>
                    attrib.ownerElement.clientWidth !== x.clientWidth &&
                    attrib.ownerElement.clientHeight !== x.clientHeight
                );
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












//            NETFLIX             ///
//            NETFLIX             ///
//            NETFLIX             ///
//            NETFLIX             ///
//            NETFLIX             ///
//            NETFLIX             ///
//            NETFLIX             ///
//            NETFLIX             ///
//            NETFLIX             ///
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