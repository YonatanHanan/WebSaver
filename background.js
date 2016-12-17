var goBack;

function getAll() {
    chrome.storage.local.get(null, function(data) {
        console.log(data);
    });
}

function clearAll() {
    chrome.storage.local.clear();
}

chrome.browserAction.onClicked.addListener(function(tab) {
    if (tab.url.indexOf(".mhtml") >= 0) {
        // Load live page and delete recorde
        chrome.storage.local.get(null, function(items) {
            var md5_url = tab.url.replace(/^.*[\\\/]/, '').replace(".mhtml", "");
            if (items[md5_url]) {
                chrome.storage.local.remove(md5_url);
                goBack = "went";
                chrome.tabs.update(tab.id, { url: items[md5_url].tab_url });
            }
        });
    } else {
        // Save the page
        var tab_md5 = md5(tab.url.split("#")[0]);
        chrome.pageCapture.saveAsMHTML({
            tabId: tab.id
        }, function(mhtmlData) {
            var reader = new window.FileReader();
            reader.readAsDataURL(mhtmlData);
            reader.onloadend = function() {
                $.post("http://localhost:3000/Chrome/save", { "data": reader.result, "file_name": tab_md5 }).done(function(data) {
                    chrome.tabs.update(tab.id, { url: data + "/mhtml/" + tab_md5 + ".mhtml" });
                    var tab_path = data + "/mhtml/" + tab_md5 + ".mhtml";

                    chrome.storage.local.set({
                        [tab_md5]: { "tab_md5": tab_md5, "tab_url": tab.url, "tab_lastupdated": +new Date(), "tab_path": tab_path, "tab_title": tab.title }
                    });
                });
            }
        });
    }
});


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == "loading" && changeInfo.url) {

        var md5_url = md5(changeInfo.url.split("#")[0]);
        chrome.storage.local.get(null, function(items) {
            if (items[md5_url]) {
                if (goBack != "went") {
                    chrome.tabs.update(tab.id, { url: items[md5_url].tab_path });
                } else {
                    goBack = "";
                }
            }
        });
    }
});
