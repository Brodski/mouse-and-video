// This file is now useless. Not worth the effort.
// BAM! https://www.youtube.com/watch?v=SRa-1ha5R3U
// fyi https://github.com/google/closure-compiler/wiki/@suppress-annotations

// 'Compilation'
// -O ADVANCE is too advanced, too much time to do. the chrome/browser API confuses it
// $ google-closure-compiler -O SIMPLE --js background.js --js_output_file background.min.js
// $ google-closure-compiler -O SIMPLE --js script.js --js_output_file script.min.js

// NO! $ google-closure-compiler -O ADVANCE --externs ../externs.js --js background.js --js_output_file background.min2.js

//
let chrome = function (whatever) {};
chrome.prototype.runtime = {};
chrome.prototype.runtime.sendMessage = function(x) {};
chrome.storage = {};
chrome.storage.local = {};
chrome.storage.local.get = function(whatever) {};
chrome.storage.onChanged = {};
chrome.storage.onChanged.get = function(x) {};
chrome.storage.onChanged.addListener = function(x) {};
chrome.runtime.onMessage = {};
chrome.runtime.onMessage.addListener = {};
chrome.tabs = {};
chrome.tabs.sendMessage = function(x) {};

let browser = function (whatever) {};
browser.runtime = {};
browser.runtime.getURL = function(x) {};
browser.windows = {};
browser.windows.get = function(x) {};
browser.windows.create = function (x) {};
browser.windows.getCurrent = function (x) {};
browser.windows.update = function (x) {};
browser.tabs = {};
browser.tabs.onActivated = {};
browser.tabs.move = function(x) {};
browser.tabs.create = function(x) {};
browser.tabs.onActivated.addListener = function(x) {};
browser.tabs.highlight = function(x) {};

// let mvObject = {};
// mvObject.popoutSetting = "";