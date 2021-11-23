let run = true;
let previousTabIndex;
let popups = {};

browser.tabs.onActivated.addListener((info) => {
  console.log("background - activated!")
  console.log(info)
  browser.windows.get(info.windowId).then((window) => {
    if (window.type !== "popup") {
      browser.tabs.get(info.previousTabId).then((tab) => {
        previousTabIndex = tab.index;
      });
    }
  });
});

function handlePopUp(message, sender) {
  console.log("background - creating pop up 1")
  console.log("background - message=", message)
  console.log("background - sender.tab.id=", sender.tab.id)
  console.log("background - previousTabIndex=", previousTabIndex)
    if (message.acao === "criar") { // message.action === create
      console.log("background - creating popup 2" )
      // browser.tabs.highlight({
      //   windowId: sender.tab.windowId,
      //   tabs: [previousTabIndex],
      // });
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
      console.log("background - done create")
    } 
    else if (message.acao === "fechar") { // message.action === close
      browser.windows.getCurrent().then((winInfo) => {
        // Move back to main window
        
        console.log("background - in close")
        console.log("background - in close, winInfo" , winInfo)
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
  console.log("Background - MSG FROM CONTENT SCRIPT  ---- ", message)
  console.log("background - sender:")
  console.log(sender)
  console.log(sender.tab.windowId)
  if (message.showIcon) {
    chrome.pageAction.show(sender.tab.id);
  } 
  else if (message.popup) {
    console.log("background - POP UP")
    handlePopUp(message, sender)
  } 
  // else if (message.popoutSetting == "newTab") {
  else if (message.popoutSetting == "fullscreen") {
    
  console.log("background - NEW TAB")
  console.log("background - message.vid")
  console.log("background - ", message.vid)
    function onError(error) {
      console.log(`Error: ${error}`);
    }
    function onCreated(tab) {
      console.log(`Created new tab: `)
      console.log(tab)
      console.log(`Created new tab, id=${tab.id}`)
    }

    var creating = browser.tabs.create({
      active: true,
      windowId: sender.tab.windowId,
      url: sender.url,
      // url:"https://example.org"
    });
    creating.then(()=> {
      console.log("background - Created new tab-")
      onCreated()
    }, onError);

    // function logTabs(tabs) {
    //   for (let tab of tabs) {
    //     console.log("background - QUERYING !!!")
    //     console.log(tab);
    //     console.log(tab.url);
    //   }
    // }    
    // let querying = browser.tabs.query({
    //   active: true,
    //   currentWindow: true
    // })
    // querying.then(logTabs, onError);

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
  console.log("background - domain")
  console.log(domain)
  //https://stackoverflow.com/questions/5364062/how-can-i-save-information-locally-in-my-chrome-extension


  chrome.storage.local.get(domain, function (info) {
    // call back function. info = returned data fromn key "domain"
    console.log("background - something at local storage ???")
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
