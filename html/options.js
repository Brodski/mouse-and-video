//////////////////////////////////////////////////////////////////////////////////////////////////
//          Adds interactive UI to the options page (ie modals)
//////////////////////////////////////////////////////////////////////////////////////////////////

window.addEventListener("load", () => {

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

  createBlacklistUi()
})

function handleBlacklist(e) {
  const container = document.getElementById('input-container');
  let allInputs = [...container.querySelectorAll("input")];
  let blacklist = []
  for (let input of allInputs) {
    if (input.value.trim() != "") {
      blacklist.push(input.value)
    }
  }
  chrome.storage.local.set({ "blacklist": blacklist }, function() {
    console.log('Inputs saved');
    console.log("after:", blacklist)
  });
}
const deleteFromStorage = (count) => {
    chrome.storage.local.get(function (options) { 
      let blacklist = options.blacklist;
      if (blacklist) {
        blacklist.splice(count, 1);
        chrome.storage.local.set({ "blacklist": blacklist }, function() {
          console.log('Inputs saved');
          console.log("after:", blacklist)
        });
      }
    })
}


const makeBlacklistInput = (count, blackItem) => {
  const container = document.getElementById('input-container');
  const miniWrap = document.createElement('div');
  const newInputDiv = document.createElement('input');
  const trashIcon = document.createElement('span');
  trashIcon.className = "trash-icon"
  trashIcon.innerText = "🗑" // 🗑;
  trashIcon.addEventListener("click", function() {
    miniWrap.remove()
    deleteFromStorage(count)
  })
  newInputDiv.setAttribute("type", "text");
  newInputDiv.setAttribute("id", "count-" + count);
  newInputDiv.value = blackItem ?? ""
  newInputDiv.addEventListener("change", handleBlacklist)
  miniWrap.appendChild(newInputDiv);
  miniWrap.appendChild(trashIcon);
  container.appendChild(miniWrap);
}


function createBlacklistUi() {

  chrome.storage.local.get(function (options) { 
    let blacklist = options.blacklist ?? [""];
    let count = 0;
    for (let blackItem of blacklist) {
      makeBlacklistInput(count, blackItem)
      count++;
    }
  })


  const addButton = document.getElementById('add-button');
  addButton.addEventListener('click', function(e) {
    e.preventDefault()
    makeBlacklistInput()
  });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
//               Manages data state from input fields
/////////////////////////////////////////////////////////////////////////////////////////////////////
window.onload = function () {
  // const disableLegend = document.querySelector("label[for=disable]");

  const incrementsLegend = document.querySelector("#fb");
  const leftInputLabel = document.querySelector("label[for=left]");
  const middleInputLabel = document.querySelector("label[for=middle]");
  const rightInputLabel = document.querySelector("label[for=right]");
  const volumeRateInputLabel = document.querySelector("label[for=volumeRate]");
  const modeLegend = document.querySelector("#mode");

  modeLegend.textContent = chrome.i18n.getMessage("mode_title");
  // disableLegend.textContent = chrome.i18n.getMessage("disable");

  incrementsLegend.textContent = chrome.i18n.getMessage("fb_title");
  leftInputLabel.textContent = chrome.i18n.getMessage("left");
  middleInputLabel.textContent = chrome.i18n.getMessage("middle");
  rightInputLabel.textContent = chrome.i18n.getMessage("right");
  volumeRateInputLabel.textContent = chrome.i18n.getMessage("volumeRate");

  for (const input of document.querySelectorAll("input")) {
    input.addEventListener("blur", (e) => {
      let value = e.target.type == "checkbox" ? e.target.checked : e.target.value;
      chrome.storage.local.set({
        [e.target.name]: value,
      });
    });
  }

  chrome.storage.local.get(function (options) {
    if (options.mode === undefined) options.mode = "mode_everything";
    if (options.popoutSetting === undefined) options.popoutSetting = "fullscreen";

    document.querySelector("[name='left'").value = options.left || 5;
    document.querySelector("[name='middle'").value = options.middle || 10;
    document.querySelector("[name='right'").value = options.right || 15;
    document.querySelector("[name='volumeRate'").value = options.volumeRate || 6;
    document.querySelector("[name='mute_middle_mouse'").checked = options.mute_middle_mouse == false ? false : true;
    document.querySelector("#" + options.mode).checked = true;
    document.querySelector("#ignore_width").value = options?.ignore_width ? options.ignore_width : null;
    // document.querySelector("#" + options.popoutSetting).checked = true;
  });
};
