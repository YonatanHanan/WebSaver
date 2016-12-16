filename = "";
var goBack;

function getAll() {
    chrome.storage.local.get(null, function(data) {
        console.log(data);
    });
}

function clearAll() {
    chrome.storage.local.clear();
}

function clean(filename) {
    var rg1 = /^(?=[\S])[^\\ \/ : * ? " < > | ]+$/;
    filename = filename.replace(/[^\w\s]/gi, '');
    return filename;
}

chrome.browserAction.onClicked.addListener(function(tab) {
    if (tab.url.indexOf(".mhtml") >= 0) {
        // Open Live page
        chrome.tabs.update(tab.id, { url: goBack.tab_url });
        chrome.storage.local.remove(goBack.tab_md5);
        goBack = null;
    } else {
        // Save the page
        var tab_md5 = md5(tab.url);
        chrome.pageCapture.saveAsMHTML({
            tabId: tab.id
        }, function(mhtmlData) {
            var reader = new window.FileReader();
            reader.readAsDataURL(mhtmlData);
            reader.onloadend = function() {
                $.post("http://localhost:3000/Chrome", { "data": reader.result, "file_name": clean(tab.title) })
                    .done(function(data) {
                        chrome.tabs.update(tab.id, { url: data + "/mhtml/" + clean(tab.title) + ".mhtml" });
                        var tab_path = data + "/mhtml/" + clean(tab.title) + ".mhtml";

                        chrome.storage.local.set({
                            [tab_md5]: { "tab_md5": tab_md5, "tab_url": tab.url, "tab_lastupdated": +new Date(), "tab_path": tab_path, "tab_title": tab.title }
                        });
                    });
            }
        });
        goBack = "";
    }
});


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var tab_md5 = md5(changeInfo.url);

    if (typeof(changeInfo.url) == "string") {
        if (changeInfo.status == "loading" || changeInfo.url.indexOf('/url?sa') < 0) {
            chrome.storage.local.get(null, function(items) {
                if (items[tab_md5]) {

                    if (goBack != null) {
                        chrome.tabs.update(tab.id, { url: items[tab_md5].tab_path });
                        tab.url = items[tab_md5].tab_path;
                    }
                    goBack = items[tab_md5];
                }
            });
        }
    }
});
