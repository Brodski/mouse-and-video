//////////////////////////////////////////////////////////////////////////////////////////////////
//          Adds interactive UI to the options page (ie modals)
//////////////////////////////////////////////////////////////////////////////////////////////////
window.addEventListener("load", () => {
  console.log("hi")

  let volume_hint = document.getElementById("volume_hint");
  let seek_hint = document.getElementById("seek_hint");
  let everything_hint = document.getElementById("everything_hint");
  
  volume_hint.addEventListener("click", ()=> { makeVisibleListeners("img_vol") })
  seek_hint.addEventListener("click", ()=> { makeVisibleListeners("img_seek") })
  everything_hint.addEventListener("click", ()=> { makeVisibleListeners("img_every") })

  let modal = document.getElementsByClassName("modal-like")[0];
  let modalImages = document.getElementsByClassName("modal-middle")[0].getElementsByTagName('img');

  function makeVisibleListeners(imgId) {
    for (let i=0; i < modalImages.length; i++) {
      if (modalImages[i].classList.contains("visible")) {
        modalImages[i].classList.remove("visible")    
      }
    }
    document.getElementById(imgId).classList.toggle("visible")
    modal.classList.toggle("visible")
  }
  document.getElementsByClassName("modal-like")[0].addEventListener("click", () => { modal.classList.toggle("visible") })

})

/////////////////////////////////////////////////////////////////////////////////////////////////////
//               Manages data state from input fields
/////////////////////////////////////////////////////////////////////////////////////////////////////
window.onload = function () {
  console.log("options.js - loaded")
  function saveChanges(option, value) {
    console.log("options.js - SAVING SAVING SAVING SAVING SAVING SAVING")
    console.log("options.js - option=", option)
    console.log("options.js - value=", value)
    chrome.storage.local.set({
      [option]: value,
    });
  }

  // const pipCheckbox = document.querySelector("#pip");
  const popoutLegend = document.querySelector("#pip-field");
  const pipLegend = document.querySelector("label[for=pip]");
  const newTabLegend = document.querySelector("label[for=newTab]");
  const disableLegend = document.querySelector("label[for=disable]");

  const incrementsLegend = document.querySelector("#fb");
  const leftInputLabel = document.querySelector("label[for=left]");
  const middleInputLabel = document.querySelector("label[for=middle]");
  const rightInputLabel = document.querySelector("label[for=right]");
  const volumeRateInputLabel = document.querySelector("label[for=volumeRate]");
  const modeLegend = document.querySelector("#mode");

  modeLegend.textContent = chrome.i18n.getMessage("mode_title");
  popoutLegend.textContent = chrome.i18n.getMessage("pop_out_video");
  pipLegend.textContent = chrome.i18n.getMessage("pip");
  // newTabLegend.textContent = chrome.i18n.getMessage("newTab");
  disableLegend.textContent = chrome.i18n.getMessage("disable");

  incrementsLegend.textContent = chrome.i18n.getMessage("fb_title");
  leftInputLabel.textContent = chrome.i18n.getMessage("left");
  middleInputLabel.textContent = chrome.i18n.getMessage("middle");
  rightInputLabel.textContent = chrome.i18n.getMessage("right");
  volumeRateInputLabel.textContent = chrome.i18n.getMessage("volumeRate");

  // no longer needed??? no longer have checkboxes
  for (const input of document.querySelectorAll("input")) {
    input.addEventListener("blur", (e) => {
      // let value = e.target.value;
      let value = e.target.type == "checkbox" ? e.target.checked : e.target.value;
      console.log("e.target.name = ", e.target.name)
      console.log("value = ", value)
      // if (e.target.type == "checkbox") value = e.target.checked;
      saveChanges(e.target.name, value);
    });
  }

  chrome.storage.local.get(function (options) {
    console.log("options.js - Got something in options sotrage")
    console.log(options)
    if (options.mode === undefined) options.mode = "mode_everything";
    // if (options.pip === undefined) options.pip = false; // does nothing?
    // if (options.newTab === undefined) options.newTab = false; // does nothing ?
    if (options.popoutSetting === undefined) options.popoutSetting = "disable";

    document.querySelector("[name='left'").value = options.left || 5;
    document.querySelector("[name='middle'").value = options.middle || 2;
    document.querySelector("[name='right'").value = options.right || 10;
    document.querySelector("[name='volumeRate'").value = options.volumeRate || 6;
    document.querySelector("[name='mute_middle_mouse'").checked = options.mute_middle_mouse == false ? false : true;
    document.querySelector("#" + options.mode).checked = true;
    document.querySelector("#" + options.popoutSetting).checked = true;
    // document.querySelectorAll("[name='mode'").querySelector("[value='" +options.popoutSetting + "']").checked = true;
    // document.querySelectorAll("[name='mode'").querySelector("[value='" +options.popoutSetting + "']").checked == false ? ;
    // console.log("Options.js - options.mute_middle_mouse=", options.mute_middle_mouse)
    // console.log("Options.js - document.querySelector('mute_middle_mouse').checked=", document.querySelector("[name='mute_middle_mouse'").checked)

    // document.querySelector("#" + options.popoutSetting).checked = true;
    // document.querySelector("#" + options.mode).checked = true;

  });
};
