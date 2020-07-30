// Check if there is video on the page. If there is, send a message to the
// background script to show the extension's icon and activate it.
const observer = new MutationObserver(function (mutationList, observer) {
  if (document.querySelector("video")) {
    chrome.runtime.sendMessage({
      showIcon: true,
    });
    observer.disconnect();
  }
});
const config = { attributes: true, childList: true, subtree: true };
observer.observe(document, config);

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

window.addEventListener(
  "message",
  (e) => {
    if (e.data.mv_topIframe) {
      // Tell the top window which iframe to move
      window.top.postMessage({ mv_iframeSrc: window.location.href }, "*");
    }

    if (window.location === window.parent.location) {
      if (e.data.mv_iframeSrc) {
        document.mv_popup_element = document.querySelector(
          `iframe[src="${e.data.mv_iframeSrc}"`
        );
        document.documentElement.style.overflow = "hidden";
        document.mv_popup_element.className += " popup_style";
        chrome.runtime.sendMessage({
          popup: true,
          acao: "criar",
        });
      } else if (e.data.mv_closePopup) {
        document.mv_popup_element.classList.remove("popup_style");
        document.documentElement.style.overflow = "revert";
        chrome.runtime.sendMessage({
          popup: true,
          acao: "fechar",
          activatePopupTab: e.data.activatePopupTab,
        });
      }
    }
  },
  false
);

/* Receive messages from background script */
chrome.runtime.onMessage.addListener(function (message) {
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
    left: options.left || 5,
    middle: options.middle || 2,
    right: options.right || 10,
    mode: options.mode || "mode_everything",
    pip: options.pip,
    brightness: 1,
    volume: 0,
    popup: (action, activatePopupTab) => {
      chrome.runtime.sendMessage({
        popup: true,
        acao: action,
        activatePopupTab: activatePopupTab,
      });
    },
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

function open_popup() {
  // if (mvObject.pip === undefined) {
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
// }

function close_popup(activatePopupTab) {
  // if (mvObject.pip || mvObject.pip === undefined) {
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
// }

// Update values if user changes them in the options
chrome.storage.onChanged.addListener(function (changes) {
  mvObject[Object.keys(changes)[0]] = changes[Object.keys(changes)[0]].newValue;
});

function run() {
  function changeVolume(delta, video) {
    if (video.muted) {
      video.muted = false;
      video.volume = 0;
    }
    mvObject.volume = video.volume;
    mvObject.volume += 1 * (delta < 0 ? 1 * (0.01 * 3) : -1 * (0.01 * 3));
    video.volume = parseFloat(
      Math.min(Math.max(mvObject.volume, 0), 1).toFixed(2)
    );
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
    video.playbackRate = parseFloat(
      Math.min(Math.max(video.playbackRate, 0.25), 4).toFixed(2)
    );
  }

  let seekTo;
  function seekVideoByAreas(cX, delta, video) {
    seekTo = video.currentTime;
    if (cX <= video.clientWidth / 3) {
      seekTo += getIncrement(delta, mvObject.left);
    } else if (
      cX > video.clientWidth / 3 &&
      cX <= (video.clientWidth / 3) * 2
    ) {
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

  function setBrightness(delta, vid) {
    mvObject.brightness += 1 * (delta < 0 ? 1 * 0.1 : -1 * 0.1);
    mvObject.brightness = parseFloat(
      Math.min(Math.max(mvObject.brightness, 0), 1).toFixed(1)
    );
    vid.style.filter = "brightness(" + mvObject.brightness + ")";
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

  function wheel(e, vid) {
    if (!document.mv_pause_function) {
      e.preventDefault();

      const cX = e.clientX - Math.round(vid.getBoundingClientRect().x);
      const delta = e.deltaY;

      if (e.shiftKey) {
        setBrightness(delta, vid);
      } else {
        if (mvObject.mode === "mode_seek_middle") {
          vid.currentTime += getIncrement(delta, mvObject.middle);
        } else if (mvObject.mode === "mode_seek_all") {
          seekVideoByAreas(cX, delta, vid);
        } else if (mvObject.mode === "mode_volume") {
          changeVolume(delta, vid);
        } else {
          if (e.offsetY <= vid.clientHeight / 2) {
            if (cX < vid.clientWidth - (90 / 100) * vid.clientWidth) {
              activateFullScreenPopupFeature(delta, vid, e);
            } else if (cX > vid.clientWidth - (10 / 100) * vid.clientWidth) {
              changePlaybackRate(delta, vid);
            } else {
              changeVolume(delta, vid);
            }
          } else {
            seekVideoByAreas(cX, delta, vid);
          }
        }
      }
    }
  }

  function main(e) {
    /* document.mv_pause_main is useful when transitioning to the popup.
    Otherwise document.mv_popup_element will change when scrolling too fast */
    if (!document.mv_pause_function && !e.target.mv_on) {
      for (const vid of document.querySelectorAll("video")) {
        if (
          !vid.paused &&
          e.clientY >= vid.getBoundingClientRect().y &&
          e.clientY <= vid.getBoundingClientRect().y + vid.clientHeight &&
          e.clientX >= vid.getBoundingClientRect().x &&
          e.clientX <= vid.getBoundingClientRect().x + vid.clientWidth &&
          (e.target.clientHeight === vid.clientHeight ||
            e.target.clientWidth === vid.clientWidth)
        ) {
          e.preventDefault();

          document.mv_popup_element = vid;

          /* ********* Popup info START ********* */
          /* This will be used to know where to place the element
          when the popup closes. 'hasPlaceholder' is used so that
          a new 'div' won't be created when the video is in the popup. */
          if (!vid.hasPlaceholder) {
            vid.hasPlaceholder = true;
            document.mv_placeholder = document.createElement("div");
            document.mv_popup_element.parentNode.insertBefore(
              document.mv_placeholder,
              document.mv_popup_element
            );
          }

          /* ********* Popup info END ********* */

          /* This is a flag to skip this video because
          we already atached the wheel function to it */
          e.target.mv_on = true;

          e.target.onwheel = (e) => wheel(e, vid);
          document.pvwm = e.target;
          break;
        }
      }
    }
  }
  document.onwheel = main;
}
