window.onload = function () {
  function saveChanges(option, value) {
    chrome.storage.local.set({
      [option]: value,
    });
  }
  const pipCheckbox = document.querySelector("#pip");
  const newTabCheckbox = document.querySelector("#newTab");
  const incrementsLegend = document.querySelector("#fb");
  const leftInputLabel = document.querySelector("label[for=left]");
  const middleInputLabel = document.querySelector("label[for=middle]");
  const rightInputLabel = document.querySelector("label[for=right]");
  const volumeRateInputLabel = document.querySelector("label[for=volumeRate]");
  const modeLegend = document.querySelector("#mode");

  document.querySelector(
    "#mode_seek_middle"
  ).textContent = chrome.i18n.getMessage("mode_seek_middle");
  document.querySelector("#mode_volume").textContent = chrome.i18n.getMessage(
    "mode_volume"
  );
  document.querySelector("#mode_seek_all").textContent = chrome.i18n.getMessage(
    "mode_seek_all"
  );
  document.querySelector(
    "#mode_everything"
  ).textContent = chrome.i18n.getMessage("mode_everything");

  modeLegend.textContent = chrome.i18n.getMessage("mode_title");
  incrementsLegend.textContent = chrome.i18n.getMessage("fb_title");
  leftInputLabel.textContent = chrome.i18n.getMessage("left");
  middleInputLabel.textContent = chrome.i18n.getMessage("middle");
  rightInputLabel.textContent = chrome.i18n.getMessage("right");
  volumeRateInputLabel.textContent = chrome.i18n.getMessage("volumeRate");
  pipCheckbox.textContent = chrome.i18n.getMessage("pip");
  newTabCheckbox.textContent = chrome.i18n.getMessage("newTab");

  for (const input of document.querySelectorAll("input")) {
    input.addEventListener("blur", (e) => {
      let value = e.target.value;
      if (e.target.type == "checkbox") value = e.target.checked;
      saveChanges(e.target.name, value);
    });
  }

  chrome.storage.local.get(function (options) {
    if (options.mode === undefined) options.mode = "mode_everything";
    if (options.pip === undefined) options.pip = true;
    if (options.newTab === undefined) options.newTab = true;
    document.querySelector("[name='left'").value = options.left || 5;
    document.querySelector("[name='middle'").value = options.middle || 2;
    document.querySelector("[name='right'").value = options.right || 10;
    document.querySelector("[name='volumeRate'").value = options.right || 6;
    document.querySelector("[name='newTab'").value = options.newTab || 6;
    pipCheckbox.checked = options.pip;
    newTabCheckbox.checked = options.newTab;
    document.querySelector("#" + options.mode).checked = true;
  });
};
