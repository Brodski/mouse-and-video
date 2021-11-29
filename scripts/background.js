// Development stuff
function LOG() {
  // let isDebugging = true;
  let isDebugging = false;
  if (isDebugging) {
    let argz = Array.from(arguments)
    console.log(... argz)
  }
}

let run = true;
let previousTabIndex;
let popups = {};

browser.tabs.onActivated.addListener((info) => {
  console.log("background - activated!", )
  browser.windows.get(info.windowId).then((window) => {
    if (window.type !== "popup") {
      browser.tabs.get(info.previousTabId).then((tab) => {
        previousTabIndex = tab.index;
      });
    }
  });
});

function handlePopUp(message, sender) {
    if (message.acao === "criar") { // message.action === create
      browser.windows.create({
        width: 370,
        height: 230,
        type: "popup",
        tabId: sender.tab.id,
      })
      .then((info) => {
        popups[info.id] = {
          tabIndex: sender.tab.index,
          windowId: sender.tab.windowId,
          popupTabId: info.tabs[0].id,
        };
        browser.windows.update(info.id, {
          left: screen.width - 390,
          top: screen.height - 255,
        });
      });
    } 
    else if (message.acao === "fechar") { // message.action === close
      browser.windows.getCurrent().then((winInfo) => {
        // Move back to main 
        if (!winInfo || !winInfo.id) {
          return
        }
        browser.tabs.move(popups[winInfo.id].popupTabId, {
            windowId: popups[winInfo.id].windowId,
            index: popups[winInfo.id].tabIndex,
          })
          .then((info) => {
            if (message.activatePopupTab) {
              browser.tabs.highlight({
                windowId: popups[winInfo.id].windowId,
                tabs: [info[0].index],
              });
            }
          });
      });
    }
}

chrome.runtime.onMessage.addListener(function (message, sender) {
  console.log("Background - Recieved message from content script  ---- ", message)
  if (message.showIcon) {
    chrome.pageAction.show(sender.tab.id);
  } 
  else if (message.popup) {
    handlePopUp(message, sender)
  } 
  else if (message.popoutSetting == "fullscreen") {
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/query
    function onError(error) {
      console.log(`Error: ${error}`);
    }
    function onCreated(tab) {
      console.log(`Created new tab: `, tab)
    }

    
    var creating = browser.tabs.create({
      active: true,
      windowId: sender.tab.windowId,
      url: sender.url,
    });
    creating.then(()=> {
      onCreated()
    }, onError);

  }

  // Aqui vamos verificar se a extensão deve ser desativada neste site. // Se o usuário desativou então o domain fica guardado.
  // Here we will check if the extension should be disabled on this website. ... If the user has deactivated then the domain is saved.
  const domain = sender.tab.url.match( /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im )[0];
  chrome.storage.local.get(domain, function (info) {
    // Se não tiver nada então não desativou
    // If there's nothing then it hasn't deactivated
    // console.log("background - background storage ", info)
    // console.log("background - background storage Object.keys(info)", Object.keys(info))
    if (Object.keys(info).length === 0) {
      chrome.tabs.sendMessage(sender.tab.id, {
        run: true,
      });
    } else {
      setIcon("disabled", sender.tab.id);
    }
  });
});

chrome.pageAction.onClicked.addListener(function (tab) {
  // This event will not fire if the page action has a popup.
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/pageAction/onClicked
  console.log("background - clicked on pageAction!")
  const domain = tab.url.match(
    /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im
  )[0];

  //https://stackoverflow.com/questions/5364062/how-can-i-save-information-locally-in-my-chrome-extension
  chrome.storage.local.get(domain, function (info) {
    // call back function. info = returned data fromn key "domain"
    if (Object.keys(info).length > 0) {
      chrome.storage.local.remove(domain);
      chrome.tabs.sendMessage(tab.id, {
        run: true,
      });
      setIcon("enabled", tab.id);
    } else {
      // Usuário desativou a extensão, então manda uma mensagem para apagar o listener.
      // User deactivated the extension, then sends a message to delete the listener
      chrome.tabs.sendMessage(tab.id, {
        disabled: true,
      });
      chrome.storage.local.set({
        [domain]: domain,
      });
      setIcon("disabled", tab.id);
    }
  });


});

function setIcon(status, id) {
  chrome.pageAction.setIcon({
    tabId: id,
    path: {
      16: "icons/" + status + "-16.png",
      32: "icons/" + status + "-32.png",
    },
  });

  chrome.pageAction.setTitle({
    tabId: id,
    title: chrome.i18n.getMessage(status),
  });
}
