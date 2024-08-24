// Development stuff
// let isDebugging = true;
// function LOG() {
//   let argz = Array.from(arguments)
//   if (isDebugging) {
//     console.log(... argz)
//   }
//     else if (isDebugging == false) {
//     console.log = function (... argz) { return };
//   }
// }



// Begin
let previousTabIndex;
let popups = {};

chrome.runtime.onMessage.addListener(function (message, sender) {
  // console.log("Background - Recieved message from content script  ---- ", message)

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    let currentTab = tabs[0];
    let url = currentTab.url;
  });

  if (message.initRun) {
    chrome.tabs.sendMessage(sender.tab.id, {
      run: true,
    });
  } 
  else if (message.popoutSetting == "fullscreen") {
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/query
    function onCreated(tab) {
      //console.log(`Created new tab: `, tab)
    }
    var creating = chrome.tabs.create({
      active: true,
      windowId: sender.tab.windowId,
      url: sender.url,
    });
    creating.then(()=> {
      onCreated()
    }, onError);
  }
});

